import { useState } from "react";
import { detectSymptoms, searchDiseases } from "../api/api";

export function useAISearch() {
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [diseaseSearchResults, setDiseaseSearchResults] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const searchAI = async (search, mode) => {
    if (!search.trim()) return;

    setLoadingAI(true);
    setAiSuggestions([]);
    setDiseaseSearchResults([]);

    try {
      if (mode === "symptoms") {
        const data = await detectSymptoms(search);
        setAiSuggestions(data.matches || []);
      } else {
        const data = await searchDiseases(search);
        setDiseaseSearchResults(data.results || []);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const clearResults = () => {
    setAiSuggestions([]);
    setDiseaseSearchResults([]);
  };

  return {
    aiSuggestions,
    diseaseSearchResults,
    loadingAI,
    searchAI,
    clearResults,
  };
}
