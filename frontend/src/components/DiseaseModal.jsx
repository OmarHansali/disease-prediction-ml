import React from "react";

export const DiseaseModal = ({ selectedDisease, diseaseDetails, closeDisease }) => (
  <div className="disease-modal-overlay" onClick={closeDisease}>
    <div className="disease-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{selectedDisease}</h2>
        <button className="modal-close" onClick={closeDisease}>×</button>
      </div>

      <div className="modal-content">
        <div className="info-section">
          <h3>📋 Description</h3>
          <p>{diseaseDetails.description}</p>
        </div>
        {diseaseDetails.precautions?.length > 0 && (
          <div className="info-section">
            <h3>⚠️ Precautions</h3>
            <ul className="info-list">{diseaseDetails.precautions.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        )}
        {diseaseDetails.medications?.length > 0 && (
          <div className="info-section">
            <h3>💊 Medications</h3>
            <ul className="info-list">{diseaseDetails.medications.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}
        {diseaseDetails.diet?.length > 0 && (
          <div className="info-section">
            <h3>🥗 Dietary Recommendations</h3>
            <ul className="info-list">{diseaseDetails.diet.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>
        )}
        {diseaseDetails.workout?.length > 0 && (
          <div className="info-section">
            <h3>🏃 Workout & Exercise</h3>
            <ul className="info-list">{diseaseDetails.workout.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  </div>
);
