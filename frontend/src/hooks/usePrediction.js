import { useState } from "react";
import { predictDisease } from "../api/api";

export function usePrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const predict = async (symptomVector) => {
    setLoadingPrediction(true);

    try {
      const data = await predictDisease(symptomVector);
      setPrediction(data);
    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const clearPrediction = () => {
    setPrediction(null);
  };

  return {
    prediction,
    loadingPrediction,
    predict,
    clearPrediction,
  };
}
