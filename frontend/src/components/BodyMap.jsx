import React from "react";

export const BodyMap = ({ view, setView, activePart, setActivePart }) => {
  const BodyParts = ({ isBack }) => (
    <g>
      {/* Head */}
      <ellipse
        cx="100"
        cy="50"
        rx="30"
        ry="35"
        className={activePart === "head" ? "active" : ""}
        onClick={() => setActivePart("head")}
      />
      {/* Neck */}
      <rect
        x="85"
        y="85"
        width="30"
        height="20"
        className={activePart === "neck" ? "active" : ""}
        onClick={() => setActivePart("neck")}
      />
      {/* Torso */}
      {!isBack ? (
        <>
          <path
            d="M70,110 L130,110 L140,180 L60,180 Z"
            className={activePart === "chest" ? "active" : ""}
            onClick={() => setActivePart("chest")}
          />
          <path
            d="M60,185 L140,185 L135,250 L65,250 Z"
            className={activePart === "abdomen" ? "active" : ""}
            onClick={() => setActivePart("abdomen")}
          />
        </>
      ) : (
        <path
          d="M65,110 L135,110 L140,250 L60,250 Z"
          className={activePart === "back" ? "active" : ""}
          onClick={() => setActivePart("back")}
        />
      )}
      {/* Pelvis */}
      <path
        d="M65,255 L135,255 L125,300 L75,300 Z"
        className={activePart === "pelvis" ? "active" : ""}
        onClick={() => setActivePart("pelvis")}
      />
      {/* Arms */}
      <path
        d="M40,115 L65,110 L55,250 L30,250 Z M135,110 L160,115 L170,250 L145,250 Z"
        className={activePart === "arms" ? "active" : ""}
        onClick={() => setActivePart("arms")}
      />
      {/* Legs */}
      <path
        d="M75,305 L100,305 L100,500 L70,500 Z M100,305 L125,305 L130,500 L100,500 Z"
        className={activePart === "legs" ? "active" : ""}
        onClick={() => setActivePart("legs")}
      />
    </g>
  );

  return (
    <div className="body-map-column card neumorphic-concave">
      <div className="view-toggle">
        <button
          className={`neumorphic-button ${view === "front" ? "active" : ""}`}
          onClick={() => setView("front")}
        >
          Front View
        </button>
        <button
          className={`neumorphic-button ${view === "back" ? "active" : ""}`}
          onClick={() => setView("back")}
        >
          Back View
        </button>
        <button
          className={`neumorphic-button ${activePart === "general" ? "active" : ""}`}
          onClick={() => setActivePart("general")}
        >
          Systemic
        </button>
      </div>

      <svg viewBox="0 0 200 550" className="body-svg">
        <BodyParts isBack={view === "back"} />
        <text x="100" y="530" textAnchor="middle" fontSize="12" fill="#999">
          {view.toUpperCase()} VIEW
        </text>
      </svg>
    </div>
  );
};
