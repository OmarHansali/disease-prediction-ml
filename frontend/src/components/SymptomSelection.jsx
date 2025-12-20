import React from "react";
import { ALL_SYMPTOMS } from "../data";

export const SymptomSelection = ({
  activePart,
  symptomVector,
  toggleSymptom,
  selectedSymptoms,
  deselectSymptom,
  clearAllSelected,
  SYMPTOM_MAPPING,
  predict
}) => {
  // Get the symptoms corresponding to the active body part
  const symptoms = SYMPTOM_MAPPING[activePart] || [];

  return (
    <div className="symptom-selection-card card neumorphic-concave">
      <h3>Region: {activePart.toUpperCase()}</h3>

      <div className="symptom-grid">
        {symptoms.map((s) => {
          const idx = ALL_SYMPTOMS.indexOf(s); // Use ALL_SYMPTOMS to get the correct index
          if (idx === -1) return null;
          return (
            <label key={idx} className={`neumorphic-checkbox ${symptomVector[idx] ? "selected" : ""}`}>
              <input
                type="checkbox"
                checked={symptomVector[idx] === 1}
                onChange={() => toggleSymptom(idx)}
              />
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
          {selectedSymptoms.map((s) => (
            <button key={s.idx} className="chip" onClick={() => deselectSymptom(s.idx)}>
              {s.name.trim()} ×
            </button>
          ))}
        </div>
      </div>

      <button className="predict-btn neumorphic-button" onClick={() => predict(symptomVector)}>
        Analyze Selected Symptoms ({symptomVector.filter((v) => v === 1).length} total)
      </button>
    </div>
  );
};
