import { useState } from "react";
import { getDiseaseDetails } from "../api/api";

export function useDiseaseDetails() {
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseDetails, setDiseaseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openDisease = async (diseaseName) => {
    setSelectedDisease(diseaseName);
    setLoadingDetails(true);

    try {
      const data = await getDiseaseDetails(diseaseName);
      setDiseaseDetails(data);
    } catch (error) {
      console.error("Disease Details Error:", error);
      setDiseaseDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDisease = () => {
    setSelectedDisease(null);
    setDiseaseDetails(null);
  };

  return {
    selectedDisease,
    diseaseDetails,
    loadingDetails,
    openDisease,
    closeDisease,
  };
}
