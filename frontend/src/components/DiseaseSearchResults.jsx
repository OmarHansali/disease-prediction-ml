import React from "react";

export const DiseaseSearchResults = ({ diseaseSearchResults, openDisease, clearResults }) => (
  <div className="disease-search-results card neumorphic-concave">
    <div className="suggestions-header">
      <strong>Matching Diseases</strong>
      <button className="close-btn" onClick={clearResults}>×</button>
    </div>
    <div className="disease-results-list">
      {diseaseSearchResults.map((result, i) => (
        <button key={i} className="disease-result-item" onClick={() => openDisease(result.disease)}>
          <div className="result-disease">{result.disease}</div>
          <div className="result-score">Match: {Math.round(result.score * 100)}%</div>
          <div className="result-desc">{result.description.substring(0, 80)}...</div>
        </button>
      ))}
    </div>
  </div>
);
