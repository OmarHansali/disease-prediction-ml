import React, { useState } from "react";
import { ALL_SYMPTOMS, SYMPTOM_MAPPING } from "./data";
import "./App.css";

// Hooks
import { useAISearch } from "./hooks/useAISearch";
import { usePrediction } from "./hooks/usePrediction";
import { useDiseaseDetails } from "./hooks/useDiseaseDetails";

// Components
import { BodyMap } from "./components/BodyMap";
import { SearchModeToggle } from "./components/SearchModeToggle";
import { SearchBox } from "./components/SearchBox";
import { AISuggestions } from "./components/AISuggestions";
import { DiseaseSearchResults } from "./components/DiseaseSearchResults";
import { SymptomSelection } from "./components/SymptomSelection";
import { DiseaseModal } from "./components/DiseaseModal";

function App() {
  // === States ===
  const [symptomVector, setSymptomVector] = useState(new Array(ALL_SYMPTOMS.length).fill(0));
  const [activePart, setActivePart] = useState("general");
  const [view, setView] = useState("front");
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("symptoms"); // 'symptoms' or 'diseases'

  // === Hooks ===
  const { aiSuggestions, diseaseSearchResults, loadingAI, searchAI, clearResults } = useAISearch();
  const { prediction, predict } = usePrediction();
  const { selectedDisease, diseaseDetails, openDisease, closeDisease } = useDiseaseDetails();

  // === Symptom Handlers ===
  const toggleSymptom = (index) => {
    const updated = [...symptomVector];
    updated[index] = updated[index] === 1 ? 0 : 1;
    setSymptomVector(updated);
  };

  const addSuggestionSymptom = (symptomName) => {
    const idx = ALL_SYMPTOMS.indexOf(symptomName);
    if (idx !== -1) {
      const updated = [...symptomVector];
      updated[idx] = 1;
      setSymptomVector(updated);
    }
  };

  const deselectSymptom = (index) => {
    const updated = [...symptomVector];
    updated[index] = 0;
    setSymptomVector(updated);
  };

  const clearAllSelected = () => {
    setSymptomVector(new Array(symptomVector.length).fill(0));
  };

  const selectedSymptoms = symptomVector
    .map((v, idx) => (v === 1 ? { idx, name: ALL_SYMPTOMS[idx] } : null))
    .filter(Boolean);

  return (
    <div className="neumorphism-app container">
      <div className="app-header">
        <h1>Symptom Analyzer</h1>
      </div>

      <div className="main-layout">
        {/* LEFT COLUMN: Body Map */}
        <BodyMap 
          view={view} 
          setView={setView}
          activePart={activePart} 
          setActivePart={setActivePart} 
        />

        {/* RIGHT COLUMN: Inputs & Results */}
        <div className="symptom-column">
          {/* Search Mode Toggle */}
          <SearchModeToggle
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            clearResults={clearResults}
            setSearch={setSearch}
          />

          {/* Search Box */}
          <SearchBox
            search={search}
            setSearch={setSearch}
            searchAI={searchAI}
            searchMode={searchMode}
            loadingAI={loadingAI}
          />

          {/* AI Suggestions */}
          {searchMode === "symptoms" && aiSuggestions.length > 0 && (
            <AISuggestions aiSuggestions={aiSuggestions} addSuggestionSymptom={addSuggestionSymptom} clearResults={clearResults} />
          )}

          {/* Disease Search Results */}
          {searchMode === "diseases" && diseaseSearchResults.length > 0 && (
            <DiseaseSearchResults diseaseSearchResults={diseaseSearchResults} openDisease={openDisease} clearResults={clearResults} />
          )}

          {/* Symptom List & Selected */}
          <SymptomSelection
            activePart={activePart}
            symptomVector={symptomVector}
            toggleSymptom={toggleSymptom}
            selectedSymptoms={selectedSymptoms}
            deselectSymptom={deselectSymptom}
            clearAllSelected={clearAllSelected}
            SYMPTOM_MAPPING={SYMPTOM_MAPPING}
            predict={predict}
          />

          {/* Prediction Result */}
          {prediction && (
            <div className="result-box card neumorphic-convex">
              <small>Most Likely Condition:</small>
              <button className="disease-name clickable-disease" onClick={() => openDisease(prediction.prediction)}>
                <strong>{prediction.prediction}</strong>
                <span className="info-icon">ℹ️</span>
              </button>
              <div className="confidence-bar">
                <div style={{ width: `${(prediction.confidence || 0) * 100}%` }}></div>
              </div>
              {prediction.top5 && prediction.top5.length > 0 && (
                <div className="top5-list">
                  <small>Top 5 possibilities</small>
                  <ul>
                    {prediction.top5.map((p, i) => (
                      <li key={i} className="top5-item">
                        <button className="disease-link" onClick={() => openDisease(p.disease)}>
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

          {/* Disease Modal */}
          {selectedDisease && diseaseDetails && (
            <DiseaseModal selectedDisease={selectedDisease} diseaseDetails={diseaseDetails} closeDisease={closeDisease} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
