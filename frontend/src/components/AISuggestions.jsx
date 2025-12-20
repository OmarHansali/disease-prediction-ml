import React from "react";

export const AISuggestions = ({ aiSuggestions, addSuggestionSymptom, clearResults }) => (
  <div className="ai-suggestions-panel card neumorphic-concave">
    <div className="suggestions-header">
      <strong>AI Suggestions</strong>
      <button className="close-btn" onClick={clearResults}>×</button>
    </div>
    <div className="suggestions-list">
      {aiSuggestions.map((symptom, i) => (
        <button key={i} className="suggestion-item" onClick={() => addSuggestionSymptom(symptom)}>
          <span className="suggestion-name">{symptom.trim()}</span>
          <span className="add-icon">+</span>
        </button>
      ))}
    </div>
  </div>
);
