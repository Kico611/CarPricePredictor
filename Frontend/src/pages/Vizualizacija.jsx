import React, { useEffect, useState } from "react";
import {
  fetchHistogram,
  fetchCategoricalMake,
  fetchCategoricalEngineFuelType,
  fetchCategoricalTransmissionType,
  fetchCategoricalDrivenWheels,
  fetchCategoricalVehicleSize,
  fetchCategoricalVehicleStyle,
  fetchMsrpScatter,
  fetchEnginePlots,
} from "../api/visualization";

const histogramEndpoints = [
  { label: "Engine HP", endpoint: "engine_hp" },
  { label: "Engine Cylinders", endpoint: "engine_cylinders" },
  { label: "Number of Doors", endpoint: "number_of_doors" },
  { label: "Highway MPG", endpoint: "highway_mpg" },
  { label: "City MPG", endpoint: "city_mpg" },
  { label: "Popularity", endpoint: "popularity" },
  { label: "MSRP", endpoint: "msrp" },
  { label: "Vehicle Age", endpoint: "vehicle_age" },
];

const Vizualizacija = () => {
  const [histograms, setHistograms] = useState({});
  const [categoricalImages, setCategoricalImages] = useState({});
  const [msrpScatter, setMsrpScatter] = useState("");
  const [enginePlots, setEnginePlots] = useState("");

  useEffect(() => {
    const loadVisualizations = async () => {
      const histoPromises = histogramEndpoints.map((item) =>
        fetchHistogram(item.endpoint)
      );
      const histoResults = await Promise.all(histoPromises);
      const histoData = {};
      histogramEndpoints.forEach((item, idx) => {
        histoData[item.label] = histoResults[idx];
      });
      setHistograms(histoData);

      const [
        make,
        engineFuelType,
        transmissionType,
        drivenWheels,
        vehicleSize,
        vehicleStyle,
      ] = await Promise.all([
        fetchCategoricalMake(),
        fetchCategoricalEngineFuelType(),
        fetchCategoricalTransmissionType(),
        fetchCategoricalDrivenWheels(),
        fetchCategoricalVehicleSize(),
        fetchCategoricalVehicleStyle(),
      ]);
      setCategoricalImages({
        Make: make,
        "Engine Fuel Type": engineFuelType,
        "Transmission Type": transmissionType,
        "Driven Wheels": drivenWheels,
        "Vehicle Size": vehicleSize,
        "Vehicle Style": vehicleStyle,
      });

      const [msrp, engine] = await Promise.all([
        fetchMsrpScatter(),
        fetchEnginePlots(),
      ]);
      setMsrpScatter(msrp);
      setEnginePlots(engine);
    };

    loadVisualizations();
  }, []);

  return (
    <div className="p-4 md:p-6 w-full mx-auto">
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          Histogrami numerčkih varijabli
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(histograms).map(([label, img], idx) => (
            <div
              key={idx}
              className="bg-white shadow-lg rounded-xl p-6 border"
              style={{ width: "100%", maxWidth: "100%" }}
            >
              <img
                src={`data:image/png;base64,${img}`}
                alt={label}
                style={{ width: "100%", height: "auto", borderRadius: "12px" }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          Frekvencije kategorijskih varijabli
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(categoricalImages).map(([label, img], idx) => (
            <div
              key={idx}
              className="bg-white shadow-lg rounded-xl p-6 border"
              style={{ width: "100%", maxWidth: "100%" }}
            >
              <img
                src={`data:image/png;base64,${img}`}
                alt={`Distribucija ${label}`}
                style={{ width: "100%", height: "auto", borderRadius: "12px" }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          Scatter plotovi
        </h1>
        <h2 className="text-4xl font-bold mb-8 text-blue-700 text-center"></h2>
        {msrpScatter && (
          <div
            className="bg-white shadow-lg rounded-xl p-6 border mx-auto"
            style={{ width: "100%", maxWidth: "1200px" }}
          >
            <img
              src={`data:image/png;base64,${msrpScatter}`}
              alt="MSRP Scatter"
              style={{ width: "100%", height: "auto", borderRadius: "12px" }}
            />
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-8 text-blue-700 text-center"></h2>
        {enginePlots && (
          <div
            className="bg-white shadow-lg rounded-xl p-6 border mx-auto"
            style={{ width: "100%", maxWidth: "1200px" }}
          >
            <img
              src={`data:image/png;base64,${enginePlots}`}
              alt="Engine Scatter Plots"
              style={{ width: "100%", height: "auto", borderRadius: "12px" }}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Vizualizacija;
