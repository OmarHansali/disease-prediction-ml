import React from "react";

export const SearchBox = ({ search, setSearch, searchAI, searchMode, loadingAI }) => (
  <div className="search-box neumorphic-inset">
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && searchAI(search, searchMode)}
      placeholder={searchMode === "symptoms" ? "Describe symptoms..." : "Describe disease..."}
      className="neumorphic-input"
    />
    <button className="neumorphic-button ai-search-btn" onClick={() => searchAI(search, searchMode)}>
      {loadingAI ? "Searching..." : "Search"}
    </button>
  </div>
);
