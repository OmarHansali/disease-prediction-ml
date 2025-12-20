const BASE_URL = "http://localhost:8000";

/* ================================
   SYMPTOM AI SEARCH
================================ */
export async function detectSymptoms(text) {
  return post("/detect_symptom", { text });
}

/* ================================
   DISEASE SEARCH
================================ */
export async function searchDiseases(text) {
  return post("/search_diseases", { text });
}

/* ================================
   DISEASE PREDICTION
================================ */
export async function predictDisease(vector) {
  return post("/predict_disease", { vector });
}

/* ================================
   DISEASE DETAILS
================================ */
export async function getDiseaseDetails(diseaseName) {
  return post("/disease_details", { text: diseaseName });
}

/* ================================
   INTERNAL POST HELPER
================================ */
async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`API error on ${endpoint}`);
  }

  return res.json();
}
