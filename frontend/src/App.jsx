import React, { useState } from 'react';
import { ALL_SYMPTOMS, SYMPTOM_MAPPING } from './data';
import './App.css';

function App() {
  const [symptomVector, setSymptomVector] = useState(new Array(270).fill(0));
  const [activePart, setActivePart] = useState('general');
  const [view, setView] = useState('front'); 
  const [search, setSearch] = useState("");
  const [prediction, setPrediction] = useState(null);

  const toggleSymptom = (index) => {
    const updated = [...symptomVector];
    updated[index] = updated[index] === 1 ? 0 : 1;
    setSymptomVector(updated);
  };

  // Reusable Body Parts to avoid duplication
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
    <div className="container">
      <div className="header-section">
        <h1>AI Symptom Analysis</h1>
        <div className="search-box">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Type a symptom..." />
          {/* <button onClick={}>AI Search</button> */}
          <button>AI Search</button>
        </div>
      </div>

      <div className="main-layout">
        <div className="body-map-column">
          <div className="view-toggle">
            <button className={view === 'front' ? 'active' : ''} onClick={() => setView('front')}>Front View</button>
            <button className={view === 'back' ? 'active' : ''} onClick={() => setView('back')}>Back View</button>
            <button className={activePart === 'general' ? 'active' : ''} onClick={() => setActivePart('general')}>Systemic</button>
          </div>

          <svg viewBox="0 0 200 550" className="body-svg">
            <BodyParts isBack={view === 'back'} />
            <text x="100" y="530" textAnchor="middle" fontSize="12" fill="#999">
              {view.toUpperCase()} VIEW
            </text>
          </svg>
        </div>

        <div className="symptom-column">
          <div className="list-header">
            <h3>Region: {activePart.toUpperCase()}</h3>
            <span>{symptomVector.filter(v => v === 1).length} Selected</span>
          </div>

          <div className="symptom-grid">
            {(SYMPTOM_MAPPING[activePart] || []).map(s => {
              const idx = ALL_SYMPTOMS.indexOf(s);
              return (
                <label key={idx} className={`symptom-card ${symptomVector[idx] ? 'selected' : ''}`}>
                  <input type="checkbox" checked={symptomVector[idx] === 1} onChange={() => toggleSymptom(idx)} />
                  {s}
                </label>
              );
            })}
          </div>

          {/* <button className="predict-btn" onClick={}> */}
          <button className="predict-btn">
            Analyze Selected Symptoms
          </button>
          
          {prediction && (
            <div className="result-box pulse">
              <small>Most Likely Condition:</small>
              <div className="disease-name">{prediction.prediction}</div>
              <div className="confidence-bar">
                 <div style={{width: `${prediction.confidence * 100}%`}}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;