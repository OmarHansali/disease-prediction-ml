import React from "react";

export const SearchModeToggle = ({ searchMode, setSearchMode, clearResults, setSearch }) => (
  <div className="search-mode-toggle">
    <button className={`mode-btn ${searchMode === "symptoms" ? "active" : ""}`} onClick={() => { setSearchMode("symptoms"); clearResults(); setSearch(""); }}>
      🔍 Symptom Search
    </button>
    <button className={`mode-btn ${searchMode === "diseases" ? "active" : ""}`} onClick={() => { setSearchMode("diseases"); clearResults(); setSearch(""); }}>
      📚 Disease Research
    </button>
  </div>
);
