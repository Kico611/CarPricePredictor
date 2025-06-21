const BASE_URL = "http://127.0.0.1:8000/visualization";

export const fetchHistogram = async (endpoint) => {
  const res = await fetch(`${BASE_URL}/histogram/${endpoint}`);
  const data = await res.json();
  return data.image_base64;
};

// Za kategorijske varijable sada posebno za svaku varijablu
export const fetchCategoricalMake = async () => {
  const res = await fetch(`${BASE_URL}/categorical/make`);
  const data = await res.json();
  return data.image_base64;
};

export const fetchCategoricalEngineFuelType = async () => {
  const res = await fetch(`${BASE_URL}/categorical/engine_fuel_type`);
  const data = await res.json();
  return data.image_base64;
};

export const fetchCategoricalTransmissionType = async () => {
  const res = await fetch(`${BASE_URL}/categorical/transmission_type`);
  const data = await res.json();
  return data.image_base64;
};

export const fetchCategoricalDrivenWheels = async () => {
  const res = await fetch(`${BASE_URL}/categorical/driven_wheels`);
  const data = await res.json();
  return data.image_base64;
};

export const fetchCategoricalVehicleSize = async () => {
  const res = await fetch(`${BASE_URL}/categorical/vehicle_size`);
  const data = await res.json();
  return data.image_base64;
};

export const fetchCategoricalVehicleStyle = async () => {
  const res = await fetch(`${BASE_URL}/categorical/vehicle_style`);
  const data = await res.json();
  return data.image_base64;
};

export const fetchMsrpScatter = async () => {
  const res = await fetch(`${BASE_URL}/msrp-scatter`);
  const data = await res.json();
  return data.image_base64;
};

export const fetchEnginePlots = async () => {
  const res = await fetch(`${BASE_URL}/engine-plots`);
  const data = await res.json();
  return data.image_base64;
};
