import React, { useState } from 'react';
import { ALL_SYMPTOMS, SYMPTOM_MAPPING } from './data';
import './App.css';

function App() {
  const [symptomVector, setSymptomVector] = useState(new Array(230).fill(0));
  const [activePart, setActivePart] = useState('general');
  const [view, setView] = useState('front'); 
  const [search, setSearch] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseDetails, setDiseaseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchMode, setSearchMode] = useState('symptoms'); // 'symptoms' or 'diseases'
  const [diseaseSearchResults, setDiseaseSearchResults] = useState([]);

  const toggleSymptom = (index) => {
    const updated = [...symptomVector];
    updated[index] = updated[index] === 1 ? 0 : 1;
    setSymptomVector(updated);
  };

  // --- API HANDLERS ---
  const handleAISearch = async () => {
    if (!search.trim()) return;
    setLoadingAI(true);
    try {
      if (searchMode === 'symptoms') {
        // Search for symptoms
        const res = await fetch('http://localhost:8000/detect_symptom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: search })
        });
        const data = await res.json();
        
        if (data.matches && data.matches.length > 0) {
          setAiSuggestions(data.matches);
        } else {
          setAiSuggestions([]);
        }
      } else {
        // Search for diseases by description
        const res = await fetch('http://localhost:8000/search_diseases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: search })
        });
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          setDiseaseSearchResults(data.results);
        } else {
          setDiseaseSearchResults([]);
        }
      }
    } catch (e) { 
      alert("Error connecting to Python Backend. Ensure FastAPI is running on http://localhost:8000.");
      if (searchMode === 'symptoms') {
        setAiSuggestions([]);
      } else {
        setDiseaseSearchResults([]);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const addSuggestionSymptom = (symptomName) => {
    const idx = ALL_SYMPTOMS.indexOf(symptomName);
    if (idx !== -1) {
      const updated = [...symptomVector];
      updated[idx] = 1;
      setSymptomVector(updated);
    }
  };

  const clearAiSuggestions = () => {
    setAiSuggestions([]);
  };

  const handlePrediction = async () => {
    try {
      const res = await fetch('http://localhost:8000/predict_disease', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({vector: symptomVector})
      });
      const data = await res.json();
      setPrediction(data);
    } catch (e) {
      alert("Error predicting disease. Ensure the backend model.pkl is loaded.");
    }
  };

  const handleDiseaseClick = async (diseaseName) => {
    setSelectedDisease(diseaseName);
    setLoadingDetails(true);
    try {
      const res = await fetch('http://localhost:8000/disease_details', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text: diseaseName })
      });
      const data = await res.json();
      setDiseaseDetails(data);
    } catch (e) {
      alert("Error loading disease details.");
      setDiseaseDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDiseaseDetails = () => {
    setSelectedDisease(null);
    setDiseaseDetails(null);
  };
  // --- END API HANDLERS ---

  // Selected symptoms helpers
  const selectedSymptoms = symptomVector
    .map((v, idx) => (v === 1 ? { idx, name: ALL_SYMPTOMS[idx] } : null))
    .filter(Boolean);

  const deselectSymptom = (index) => {
    const updated = [...symptomVector];
    updated[index] = 0;
    setSymptomVector(updated);
  };

  const clearAllSelected = () => {
    setSymptomVector(new Array(symptomVector.length).fill(0));
  };


  // Reusable Body Parts (Same logic, now with Neumorphism classes in the render block)
  const BodyParts = ({ isBack }) => (
    <g>
      {/* Head */}
      <ellipse cx="100" cy="50" rx="30" ry="35" 
               className={activePart === 'head' ? 'active' : ''} 
               onClick={() => setActivePart('head')} />
      
      {/* Neck */}
      <rect x="85" y="85" width="30" height="20" 
            className={activePart === 'neck' ? 'active' : ''} 
            onClick={() => setActivePart('neck')} />

      {/* Torso: Chest/Abdomen (Front) vs Back (Back) */}
      {!isBack ? (
        <>
          <path d="M70,110 L130,110 L140,180 L60,180 Z" 
                className={activePart === 'chest' ? 'active' : ''} 
                onClick={() => setActivePart('chest')} />
          <path d="M60,185 L140,185 L135,250 L65,250 Z" 
                className={activePart === 'abdomen' ? 'active' : ''} 
                onClick={() => setActivePart('abdomen')} />
        </>
      ) : (
        <path d="M65,110 L135,110 L140,250 L60,250 Z" 
              className={activePart === 'back' ? 'active' : ''} 
              onClick={() => setActivePart('back')} />
      )}

      {/* Pelvis/Pelvic */}
      <path d="M65,255 L135,255 L125,300 L75,300 Z" 
            className={activePart === 'pelvis' ? 'active' : ''} 
            onClick={() => setActivePart('pelvis')} />

      {/* Arms */}
      <path d="M40,115 L65,110 L55,250 L30,250 Z M135,110 L160,115 L170,250 L145,250 Z" 
            className={activePart === 'arms' ? 'active' : ''} 
            onClick={() => setActivePart('arms')} />

      {/* Legs */}
      <path d="M75,305 L100,305 L100,500 L70,500 Z M100,305 L125,305 L130,500 L100,500 Z" 
            className={activePart === 'legs' ? 'active' : ''} 
            onClick={() => setActivePart('legs')} />
    </g>
  );

  return (
    <div className="neumorphism-app container">
      <div className="app-header">
        <h1>Soft UI Symptom Analyzer</h1>
      </div>

      <div className="main-layout">
        
        {/* === LEFT COLUMN: Body Map === */}
        <div className="body-map-column card neumorphic-concave">
          
          <div className="view-toggle">
            <button className={`neumorphic-button ${view === 'front' ? 'active' : ''}`} onClick={() => setView('front')}>Front View</button>
            <button className={`neumorphic-button ${view === 'back' ? 'active' : ''}`} onClick={() => setView('back')}>Back View</button>
            <button className={`neumorphic-button ${activePart === 'general' ? 'active' : ''}`} onClick={() => setActivePart('general')}>Systemic</button>
          </div>
          
          <svg viewBox="0 0 200 550" className="body-svg">
            <BodyParts isBack={view === 'back'} />
            <text x="100" y="530" textAnchor="middle" fontSize="12" fill="#999">
               {view.toUpperCase()} VIEW
            </text>
          </svg>
        </div>

        {/* === RIGHT COLUMN: Input and Results === */}
        <div className="symptom-column">
          
          {/* Search Mode Toggle */}
          <div className="search-mode-toggle">
            <button 
              className={`mode-btn ${searchMode === 'symptoms' ? 'active' : ''}`}
              onClick={() => { setSearchMode('symptoms'); setAiSuggestions([]); setDiseaseSearchResults([]); setSearch(''); }}
            >
              🔍 Symptom Search
            </button>
            <button 
              className={`mode-btn ${searchMode === 'diseases' ? 'active' : ''}`}
              onClick={() => { setSearchMode('diseases'); setAiSuggestions([]); setDiseaseSearchResults([]); setSearch(''); }}
            >
              📚 Disease Research
            </button>
          </div>

          {/* Search Bar Element */}
          <div className="search-box neumorphic-inset">
            <input 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              placeholder={searchMode === 'symptoms' ? "Describe symptoms (e.g., 'stomach ache and fatigue')..." : "Describe disease (e.g., 'pancreatic inflammation after drinking')..."}
              className="neumorphic-input"
            />
            <button className="neumorphic-button ai-search-btn" onClick={handleAISearch}>
              {loadingAI ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Symptom Suggestions Preview Panel */}
          {searchMode === 'symptoms' && aiSuggestions.length > 0 && (
            <div className="ai-suggestions-panel card neumorphic-concave">
              <div className="suggestions-header">
                <strong>AI Suggestions</strong>
                <button className="close-btn" onClick={clearAiSuggestions}>×</button>
              </div>
              <div className="suggestions-list">
                {aiSuggestions.map((symptom, i) => (
                  <button key={i} className="suggestion-item" onClick={() => {
                    addSuggestionSymptom(symptom);
                  }}>
                    <span className="suggestion-name">{symptom.trim()}</span>
                    <span className="add-icon">+</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Disease Search Results Panel */}
          {searchMode === 'diseases' && diseaseSearchResults.length > 0 && (
            <div className="disease-search-results card neumorphic-concave">
              <div className="suggestions-header">
                <strong>Matching Diseases</strong>
                <button className="close-btn" onClick={() => setDiseaseSearchResults([])}>×</button>
              </div>
              <div className="disease-results-list">
                {diseaseSearchResults.map((result, i) => (
                  <button key={i} className="disease-result-item" onClick={() => handleDiseaseClick(result.disease)}>
                    <div className="result-disease">{result.disease}</div>
                    <div className="result-score">Match: {Math.round(result.score * 100)}%</div>
                    <div className="result-desc">{result.description.substring(0, 80)}...</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Symptom List Element */}
          <div className="symptom-selection-card card neumorphic-concave">
            <h3>Region: {activePart.toUpperCase()}</h3>
            <div className="symptom-grid">
              {(SYMPTOM_MAPPING[activePart] || []).map(s => {
                const idx = ALL_SYMPTOMS.indexOf(s);
                if (idx === -1) return null; // Skip if symptom isn't in ALL_SYMPTOMS

                return (
                  <label key={idx} className={`neumorphic-checkbox ${symptomVector[idx] ? 'selected' : ''}`}>
                    <input type="checkbox" checked={symptomVector[idx] === 1} onChange={() => toggleSymptom(idx)} />
                    {s}
                  </label>
                );
              })}
            </div>
            
            <div className="selected-panel card neumorphic-concave">
              <div className="selected-header">
                <strong>Selected Symptoms</strong>
                <button className="clear-btn" onClick={clearAllSelected}>Clear all</button>
              </div>
              <div className="selected-list">
                {selectedSymptoms.length === 0 && <small className="muted">No symptoms selected</small>}
                {selectedSymptoms.map(s => (
                  <button key={s.idx} className="chip" onClick={() => deselectSymptom(s.idx)}>
                    {s.name.trim()} ×
                  </button>
                ))}
              </div>
            </div>

            <button className="predict-btn neumorphic-button" onClick={handlePrediction}>
              Analyze Selected Symptoms ({symptomVector.filter(v => v === 1).length} total)
            </button>
          </div>
          
          {/* Prediction Result Element */}
          {prediction && (
            <div className="result-box card neumorphic-convex">
              <small>Most Likely Condition:</small>
              <button 
                className="disease-name clickable-disease" 
                onClick={() => handleDiseaseClick(prediction.prediction)}
              >
                <strong>{prediction.prediction}</strong>
                <span className="info-icon">ℹ️</span>
              </button>
              <div className="confidence-bar">
                 <div style={{width: `${(prediction.confidence || 0) * 100}%`}}></div>
              </div>

              {/* Top 5 suggestions with percentages */}
              {prediction.top5 && prediction.top5.length > 0 && (
                <div className="top5-list">
                  <small>Top 5 possibilities (Click to see details)</small>
                  <ul>
                    {prediction.top5.map((p, i) => (
                      <li key={i} className="top5-item">
                        <button 
                          className="disease-link"
                          onClick={() => handleDiseaseClick(p.disease)}
                        >
                          <span className="disease">{p.disease}</span>
                        </button>
                        <span className="pct">{Math.round(p.probability * 1000) / 10}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Disease Details Modal */}
          {selectedDisease && diseaseDetails && (
            <div className="disease-modal-overlay" onClick={closeDiseaseDetails}>
              <div className="disease-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{selectedDisease}</h2>
                  <button className="modal-close" onClick={closeDiseaseDetails}>×</button>
                </div>

                <div className="modal-content">
                  {/* Description Section */}
                  <div className="info-section">
                    <h3>📋 Description</h3>
                    <p>{diseaseDetails.description}</p>
                  </div>

                  {/* Precautions Section */}
                  {diseaseDetails.precautions && diseaseDetails.precautions.length > 0 && (
                    <div className="info-section">
                      <h3>⚠️ Precautions</h3>
                      <ul className="info-list">
                        {diseaseDetails.precautions.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Medications Section */}
                  {diseaseDetails.medications && diseaseDetails.medications.length > 0 && (
                    <div className="info-section">
                      <h3>💊 Medications</h3>
                      <ul className="info-list">
                        {diseaseDetails.medications.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Diet Section */}
                  {diseaseDetails.diet && diseaseDetails.diet.length > 0 && (
                    <div className="info-section">
                      <h3>🥗 Dietary Recommendations</h3>
                      <ul className="info-list">
                        {diseaseDetails.diet.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Workout Section */}
                  {diseaseDetails.workout && diseaseDetails.workout.length > 0 && (
                    <div className="info-section">
                      <h3>🏃 Workout & Exercise</h3>
                      <ul className="info-list">
                        {diseaseDetails.workout.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;