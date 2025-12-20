import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import numpy as np # Import numpy here for use in the prediction endpoint
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import json

# --- 1. IMPORT YOUR SYMPTOM LIST ---
from symptoms import SYMPTOMS_LIST 

# --- Determine the expected input length dynamically ---
EXPECTED_SYMPTOM_COUNT = len(SYMPTOMS_LIST)
# print(f"Expected symptom vector length: {EXPECTED_SYMPTOM_COUNT}") 

# --- 2. FASTAPI SETUP ---
app = FastAPI(title="AI Symptom Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. MODEL INITIALIZATION (LOAD ONCE) ---
try:
    DISEASE_MODEL = joblib.load('model/voting_ensemble_model.pkl') 
    NLP_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    SYMPTOM_EMBEDDINGS = NLP_MODEL.encode(SYMPTOMS_LIST, convert_to_tensor=True)
    print("✅ Models and embeddings loaded successfully.")

except Exception as e:
    print(f"❌ ERROR loading models: {e}")
    DISEASE_MODEL = None
    NLP_MODEL = None

# --- BUILD LABEL MAPPING ---
LABEL_ENCODER = None
MODEL_CLASS_NAMES = None
if DISEASE_MODEL is not None:
    try:
        model_classes = DISEASE_MODEL.classes_
        # If classes_ are strings, use them directly
        if hasattr(model_classes, 'dtype') and model_classes.dtype.kind in ('U', 'S', 'O'):
            MODEL_CLASS_NAMES = [str(c) for c in model_classes]
        else:
            # numeric classes: rebuild a LabelEncoder from the training CSV to map back
            try:
                df_labels = pd.read_csv('Diseases_and_Symptoms_dataset.csv')
                le = LabelEncoder()
                le.fit(df_labels['diseases'])
                LABEL_ENCODER = le
                # Map model.classes_ (numeric) to actual names via inverse_transform
                MODEL_CLASS_NAMES = [le.inverse_transform([int(c)])[0] for c in model_classes]
            except Exception:
                # fallback: use stringified class values
                MODEL_CLASS_NAMES = [str(c) for c in model_classes]
    except Exception:
        MODEL_CLASS_NAMES = None

# --- LOAD DISEASE INFORMATION CSVs ---
DISEASE_INFO = {}
DISEASE_DETAILS = {}
try:
    # Load descriptions
    desc_df = pd.read_csv('description.csv')
    descriptions = {disease.lower().strip(): desc for disease, desc in zip(desc_df['Disease'], desc_df['Description'])}
    
    # Load precautions
    prec_df = pd.read_csv('precautions.csv')
    precautions = {}
    for _, row in prec_df.iterrows():
        disease = row['Disease']
        precs = [row[f'Precaution_{i}'] for i in range(1, 5) if pd.notna(row.get(f'Precaution_{i}'))]
        # Normalize disease name for consistent matching
        disease_normalized = disease.lower().strip()
        precautions[disease_normalized] = precs
    
    # Load medications
    med_df = pd.read_csv('medications.csv')
    medications = {}
    for _, row in med_df.iterrows():
        disease = row['Disease']
        # Parse the list string if needed
        meds = row['Medication']
        if isinstance(meds, str) and meds.startswith('['):
            try:
                meds = eval(meds)
            except:
                meds = [meds]
        # Normalize disease name for consistent matching
        disease_normalized = disease.lower().strip()
        medications[disease_normalized] = meds if isinstance(meds, list) else [meds]
    
    # Load diets
    diet_df = pd.read_csv('diets.csv')
    diets = {}
    for _, row in diet_df.iterrows():
        disease = row['Disease']
        diet = row['Diet']
        if isinstance(diet, str) and diet.startswith('['):
            try:
                diet = eval(diet)
            except:
                diet = [diet]
        # Normalize disease name for consistent matching
        disease_normalized = disease.lower().strip()
        diets[disease_normalized] = diet if isinstance(diet, list) else [diet]
    
    # Load workouts
    workout_df = pd.read_csv('workout.csv')
    workouts = {}
    for _, row in workout_df.iterrows():
        disease = row['Disease']
        workout = row['Workouts']
        if isinstance(workout, str) and workout.startswith('['):
            try:
                workout = eval(workout)
            except:
                workout = [workout]
        # Normalize disease name for consistent matching
        disease_normalized = disease.lower().strip()
        workouts[disease_normalized] = workout if isinstance(workout, list) else [workout]
    
    # Build combined DISEASE_INFO with normalized names
    for disease_name in MODEL_CLASS_NAMES or []:
        disease_normalized = disease_name.lower().strip()
        DISEASE_INFO[disease_normalized] = {
            'description': descriptions.get(disease_normalized, 'No description available'),
            'precautions': precautions.get(disease_normalized, []),
            'medications': medications.get(disease_normalized, []),
            'diet': diets.get(disease_normalized, []),
            'workout': workouts.get(disease_normalized, [])
        }
    
    # Attempt to load `details.csv` which may contain richer disease text to search.
    try:
        details_df = pd.read_csv('description.csv')
        # Find a likely text column in details_df
        text_col = None
        for candidate in ['Details', 'details', 'Description', 'description', 'Info', 'info', 'Text', 'text']:
            if candidate in details_df.columns:
                text_col = candidate
                break

        if text_col and 'Disease' in details_df.columns:
            DISEASE_DETAILS = dict(zip(details_df['Disease'], details_df[text_col].fillna('').astype(str)))
        else:
            DISEASE_DETAILS = {k: v.get('description', '') for k, v in DISEASE_INFO.items()}
    except Exception:
        DISEASE_DETAILS = {k: v.get('description', '') for k, v in DISEASE_INFO.items()}

    print(f"✅ Loaded disease information for {len(DISEASE_INFO)} diseases")
except Exception as e:
    print(f"⚠️ Error loading disease information CSVs: {e}")
    DISEASE_INFO = {}


# --- 4. DATA MODELS ---
class NLPSearchRequest(BaseModel):
    text: str

class PredictionRequest(BaseModel):
    # This list represents the binary vector. Its length will be validated below.
    vector: list[int]


# --- 5. API ENDPOINTS ---

@app.post("/detect_symptom")
async def detect_symptom(request: NLPSearchRequest):
    """
    NLP Search: Maps user's natural language to structured symptoms.
    """
    if not NLP_MODEL:
        return {"matches": [], "error": "NLP model not initialized."}
        
    query_text = request.text.lower()
    
    # Encode the user's query
    query_embedding = NLP_MODEL.encode(query_text, convert_to_tensor=True)
    
    # Perform semantic search against the pre-calculated symptom embeddings
    hits = util.semantic_search(query_embedding, SYMPTOM_EMBEDDINGS, top_k=5)
    
    # Filter and extract matches that have high confidence (e.g., score > 0.4)
    matched_symptoms = [
        SYMPTOMS_LIST[hit['corpus_id']] 
        for hit in hits[0] 
        if hit['score'] > 0.4
    ]
    
    return {"matches": list(set(matched_symptoms))}


@app.post("/predict_disease")
async def predict_disease(request: PredictionRequest):
    """
    ML Prediction: Takes the binary vector and returns a diagnosis.
    """
    if not DISEASE_MODEL:
        raise HTTPException(status_code=503, detail="ML model is not loaded.")
        
    # --- MODIFICATION HERE: Check input length dynamically ---
    if len(request.vector) != EXPECTED_SYMPTOM_COUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Input vector length mismatch. Expected {EXPECTED_SYMPTOM_COUNT} features but received {len(request.vector)}."
        )
    # --------------------------------------------------------
        
    # Input vector converted to a NumPy array and reshaped for the model
    input_array = np.array(request.vector).reshape(1, -1)
    
    # Get the raw prediction and probabilities
    prediction_raw = DISEASE_MODEL.predict(input_array)[0]
    prediction_proba = DISEASE_MODEL.predict_proba(input_array)[0]

    # Resolve class names for each model class entry
    try:
        if MODEL_CLASS_NAMES is not None:
            class_names = MODEL_CLASS_NAMES
        else:
            class_names = [str(c) for c in DISEASE_MODEL.classes_]
    except Exception:
        class_names = [str(c) for c in DISEASE_MODEL.classes_]

    # Build list of disease-prob pairs (aligned with model.classes_ ordering)
    # Filter out zero probabilities
    probs = [
        {"disease": class_names[i], "probability": float(prediction_proba[i])}
        for i in range(len(class_names))
        if prediction_proba[i] > 0.0
    ]

    top5 = sorted(probs, key=lambda x: x['probability'], reverse=True)[:5]

    best = top5[0]

    return {
        "prediction": best['disease'],
        "confidence": float(best['probability']),
        "top5": top5
    }


@app.post("/disease_details")
async def get_disease_details(request: NLPSearchRequest):
    """
    Retrieves detailed information about a disease including:
    - Description
    - Precautions
    - Medications
    - Diet recommendations
    - Workout/Exercise recommendations
    """
    disease_name = request.text.strip()
    disease_normalized = disease_name.lower().strip()
    
    if disease_normalized not in DISEASE_INFO:
        raise HTTPException(
            status_code=404,
            detail=f"Disease '{disease_name}' not found in database"
        )
    
    info = DISEASE_INFO[disease_normalized]
    return {
        "disease": disease_name,
        "description": info['description'],
        "precautions": info['precautions'],
        "medications": info['medications'],
        "diet": info['diet'],
        "workout": info['workout']
    }


@app.post("/search_diseases")
async def search_diseases(request: NLPSearchRequest):
    """
    Search for diseases by describing their symptoms or characteristics.
    Uses semantic search on disease descriptions to help doctors research/verify diagnoses.
    Example: "pancreatic inflammation after drinking" -> finds Acute Pancreatitis
    """
    if not NLP_MODEL:
        return {"results": [], "error": "NLP model not initialized."}
    
    query_text = request.text.lower()
    
    print(f"Searching diseases for query: {query_text}")
    # Encode doctor's query about the disease
    query_embedding = NLP_MODEL.encode(query_text, convert_to_tensor=True)
    
    # Encode all disease descriptions
    # Prefer searching `details.csv` loaded into DISEASE_DETAILS; fall back to DISEASE_INFO descriptions
    source_map = DISEASE_DETAILS if DISEASE_DETAILS else {k: v.get('description', '') for k, v in DISEASE_INFO.items()}

    disease_names = list(source_map.keys())
    descriptions = [source_map[d] for d in disease_names]
    description_embeddings = NLP_MODEL.encode(descriptions, convert_to_tensor=True)

    # Search against descriptions/details
    hits = util.semantic_search(query_embedding, description_embeddings, top_k=20)

    # Build results with disease details and keep top matches
    results = []
    for hit in hits[0]:
        if hit['score'] > 0.25:
            disease_idx = hit['corpus_id']
            disease_name = disease_names[disease_idx]
            results.append({
                "disease": disease_name,
                "score": float(hit['score']),
                "description": source_map.get(disease_name, '')
            })

    # Sort by score and return top 5
    results = sorted(results, key=lambda x: x['score'], reverse=True)[:5]

    print(results)
    return {"results": results}
if __name__ == "__main__":
    import uvicorn
    print(f"\n🚀 Starting FastAPI server with {EXPECTED_SYMPTOM_COUNT} features on http://127.0.0.1:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)