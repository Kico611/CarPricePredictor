// src/api/stats.js

export async function fetchDataInfo() {
  const res = await fetch("http://localhost:8000/stats/info");
  if (!res.ok) {
    throw new Error("Greška pri dohvaćanju podataka");
  }
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch("http://localhost:8000/stats/summary");
  if (!res.ok) {
    throw new Error("Greška pri dohvaćanju summary podataka");
  }
  return res.json();
}

export async function fetchValueCounts() {
  const res = await fetch("http://localhost:8000/stats/value_counts");
  if (!res.ok) {
    throw new Error("Greška pri dohvaćanju frekvencija vrijednosti");
  }
  return res.json();
}

export async function fetchMissingValues() {
  const res = await fetch("http://localhost:8000/stats/missing_values");
  if (!res.ok) {
    throw new Error("Greška pri dohvaćanju nedostajućih vrijednosti");
  }
  return res.json();
}

export const fetchHighlights = async () => {
  try {
    const response = await fetch("http://localhost:8000/stats/highlights");
    if (!response.ok) {
      throw new Error("Greška prilikom dohvaćanja zanimljivosti");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Greška u fetchHighlights:", error);
    return null;
  }
};
