import React, { useState } from "react";
import {
  makeOptions,
  engineFuelTypeOptions,
  transmissionTypeOptions,
  drivenWheelsOptions,
  vehicleSizeOptions,
  vehicleStyleOptions,
} from "../constants/dropdownOptions";

const numberOfDoorsOptions = ["2", "3", "4", "5"];
const engineCylindersOptions = ["3", "4", "5", "6", "8", "10", "12"];

const Predictions = () => {
  const [formData, setFormData] = useState({
    Make: "",
    Engine_Fuel_Type: "",
    Engine_HP: "",
    Engine_Cylinders: "",
    Transmission_Type: "",
    Driven_Wheels: "",
    Number_of_Doors: "",
    Vehicle_Size: "",
    Vehicle_Style: "",
    Vehicle_Age: "",
    average_mpg: "",
  });

  const [predictionML, setPredictionML] = useState(null);
  const [predictionDL, setPredictionDL] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPredictionML(null);
    setPredictionDL(null);

    const payload = {
      ...formData,
      Engine_HP: parseFloat(formData.Engine_HP),
      Engine_Cylinders: parseFloat(formData.Engine_Cylinders),
      Number_of_Doors: parseInt(formData.Number_of_Doors, 10),
      Popularity: 1554.91, // fiksna vrijednost
      Vehicle_Age: parseFloat(formData.Vehicle_Age),
      average_mpg: parseFloat(formData.average_mpg),
    };

    try {
      // XGBoost predikcija
      const responseML = await fetch(
        "http://localhost:8000/predictions/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!responseML.ok) {
        const errorData = await responseML.json();
        throw new Error(errorData.error || "Greška kod ML predikcije");
      }

      const dataML = await responseML.json();
      setPredictionML(dataML.predicted_MSRP);

      // DL predikcija
      const responseDL = await fetch(
        "http://localhost:8000/predictions/predict_dl",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!responseDL.ok) {
        const errorData = await responseDL.json();
        throw new Error(errorData.error || "Greška kod DL predikcije");
      }

      const dataDL = await responseDL.json();
      setPredictionDL(dataDL.predicted_MSRP);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Predikcija cijene automobila
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Make"
          name="Make"
          value={formData.Make}
          options={makeOptions}
          onChange={handleChange}
        />
        <Select
          label="Engine Fuel Type"
          name="Engine_Fuel_Type"
          value={formData.Engine_Fuel_Type}
          options={engineFuelTypeOptions}
          onChange={handleChange}
        />
        <Input
          label="Engine HP"
          name="Engine_HP"
          value={formData.Engine_HP}
          onChange={handleChange}
          type="number"
          step="0.1"
        />
        <Select
          label="Engine Cylinders"
          name="Engine_Cylinders"
          value={formData.Engine_Cylinders}
          options={engineCylindersOptions}
          onChange={handleChange}
        />
        <Select
          label="Transmission Type"
          name="Transmission_Type"
          value={formData.Transmission_Type}
          options={transmissionTypeOptions}
          onChange={handleChange}
        />
        <Select
          label="Driven Wheels"
          name="Driven_Wheels"
          value={formData.Driven_Wheels}
          options={drivenWheelsOptions}
          onChange={handleChange}
        />
        <Select
          label="Number of Doors"
          name="Number_of_Doors"
          value={formData.Number_of_Doors}
          options={numberOfDoorsOptions}
          onChange={handleChange}
        />
        <Select
          label="Vehicle Size"
          name="Vehicle_Size"
          value={formData.Vehicle_Size}
          options={vehicleSizeOptions}
          onChange={handleChange}
        />
        <Select
          label="Vehicle Style"
          name="Vehicle_Style"
          value={formData.Vehicle_Style}
          options={vehicleStyleOptions}
          onChange={handleChange}
        />
        <Input
          label="Vehicle Age"
          name="Vehicle_Age"
          value={formData.Vehicle_Age}
          onChange={handleChange}
          type="number"
          step="0.1"
        />
        <Input
          label="Average MPG"
          name="average_mpg"
          value={formData.average_mpg}
          onChange={handleChange}
          type="number"
          step="0.1"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
        >
          Predvidi MSRP
        </button>
      </form>

      {predictionML !== null && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded text-center font-semibold text-lg">
          ML model predviđa MSRP: ${predictionML.toFixed(2)}
        </div>
      )}

      {predictionDL !== null && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded text-center font-semibold text-lg">
          DL model predviđa MSRP: ${predictionDL.toFixed(2)}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded text-center font-semibold">
          Greška: {error}
        </div>
      )}
    </div>
  );
};

const Select = ({ label, name, value, options, onChange }) => (
  <label className="block mb-4">
    <span className="text-gray-700 font-medium">{label}:</span>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required
      className="mt-1 block w-full rounded border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">-- odaberite --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </label>
);

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  step,
  min,
  max,
}) => (
  <label className="block mb-4">
    <span className="text-gray-700 font-medium">{label}:</span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      step={step}
      min={min}
      max={max}
      required
      className="mt-1 block w-full rounded border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </label>
);

export default Predictions;
