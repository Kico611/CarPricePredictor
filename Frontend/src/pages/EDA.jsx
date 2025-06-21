import React, { useEffect, useState } from "react";
import {
  fetchDataInfo,
  fetchSummary,
  fetchValueCounts,
  fetchMissingValues,
  fetchHighlights,
} from "../api/stats";

function EDA() {
  const [dataInfo, setDataInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [valueCounts, setValueCounts] = useState(null);
  const [missingValues, setMissingValues] = useState(null);
  const [highlights, setHighlights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchDataInfo(),
      fetchSummary(),
      fetchValueCounts(),
      fetchMissingValues(),
      fetchHighlights(),
    ])
      .then(
        ([
          dataInfoResult,
          summaryResult,
          valueCountsResult,
          missingValuesResult,
          highlightsResult,
        ]) => {
          setDataInfo(dataInfoResult);
          setSummary(summaryResult);
          setValueCounts(valueCountsResult);
          setMissingValues(missingValuesResult);
          setHighlights(highlightsResult);
          setLoading(false);
        }
      )
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">Učitavanje podataka...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="w-full p-6 bg-white shadow-lg rounded-lg mt-8">
      {/* Informacije o podacima */}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        Informacije o podacima
      </h1>
      <p className="mb-4">
        Ukupno zapisa:{" "}
        <span className="font-semibold">
          {typeof dataInfo?.total_rows === "number"
            ? dataInfo.total_rows.toLocaleString("hr-HR")
            : "N/A"}
        </span>
      </p>
      <p className="mb-4">
        Ukupno duplikata:{" "}
        <span className="font-semibold">{(729).toLocaleString("hr-HR")}</span>
      </p>
      <p className="mb-4">
        Ukupno stupaca:{" "}
        <span className="font-semibold">
          {typeof dataInfo?.total_columns === "number"
            ? dataInfo.total_columns.toLocaleString("hr-HR")
            : "N/A"}
        </span>
      </p>
      <h2 className="text-2xl font-semibold mb-4">Stupci:</h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto mb-10">
        {dataInfo?.columns?.map((col) => (
          <div
            key={col.name}
            className="border border-gray-300 p-4 rounded-md hover:shadow-md transition"
          >
            <p>
              <span className="font-semibold">Naziv:</span> {col.name}
            </p>
            <p>
              <span className="font-semibold">Tip podatka:</span> {col.dtype}
            </p>
            <p>
              <span className="font-semibold">
                Broj jedinstvenih vrijednosti:
              </span>{" "}
              {typeof col.unique_values === "number"
                ? col.unique_values.toLocaleString("hr-HR")
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold">Opis:</span>{" "}
              {col.description ?? "Nema opisa"}
            </p>
          </div>
        ))}
      </div>

      {/* Zanimljivosti */}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Zanimljivosti</h1>
      {highlights && (
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {Object.entries(highlights).map(([key, value]) => (
            <div
              key={key}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </h3>

              {typeof value === "object" && value !== null ? (
                <div className="space-y-1 text-gray-700 text-sm">
                  {Object.entries(value).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="font-medium capitalize">
                        {k
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="text-right">
                        {typeof v === "number"
                          ? // Nemoj formatirati ako je godina
                            k.toLowerCase().includes("year")
                            ? v
                            : v.toLocaleString("hr-HR")
                          : v}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-800 text-sm">
                  {typeof value === "number"
                    ? value.toLocaleString("hr-HR")
                    : value}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Deskriptivna statistika */}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        Deskriptivna statistika
      </h1>
      {summary && (
        <div className="overflow-auto max-h-[400px] mb-10">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 p-2 text-left">Stupac</th>
                {Object.keys(summary[Object.keys(summary)[0]]).map((stat) => (
                  <th
                    key={stat}
                    className="border border-gray-300 p-2 text-right"
                  >
                    {stat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([colName, stats]) => (
                <tr key={colName} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2 font-semibold">
                    {colName}
                  </td>
                  {Object.values(stats).map((value, idx) => (
                    <td
                      key={idx}
                      className="border border-gray-300 p-2 text-right"
                    >
                      {typeof value === "number" ? value.toFixed(2) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Frekvencije kategorijskih vrijednosti */}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        Frekvencije kategorijskih vrijednosti
      </h1>
      {valueCounts && (
        <div className="space-y-6 max-h-[400px] overflow-y-auto">
          {Object.entries(valueCounts).map(([colName, counts]) => (
            <div
              key={colName}
              className="border border-gray-300 p-4 rounded-md hover:shadow-md transition"
            >
              <h3 className="font-semibold mb-2">{colName}</h3>
              <ul className="list-disc list-inside max-h-48 overflow-auto text-sm">
                {Object.entries(counts).map(([val, { count, percentage }]) => (
                  <li key={val}>
                    <span className="font-semibold">{val}:</span>{" "}
                    {typeof count === "number"
                      ? count.toLocaleString("hr-HR")
                      : count}{" "}
                    (
                    {typeof percentage === "number"
                      ? percentage.toFixed(2)
                      : percentage}{" "}
                    %)
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Nedostajuće vrijednosti */}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        Nedostajuće vrijednosti
      </h1>
      {missingValues && (
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 p-2 text-left">Stupac</th>
                <th className="border border-gray-300 p-2 text-right">
                  Broj nedostajućih
                </th>
                <th className="border border-gray-300 p-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(missingValues).map(
                ([colName, { missing_count, missing_percentage }]) => (
                  <tr key={colName} className="hover:bg-blue-50 transition">
                    <td className="border border-gray-300 p-3 font-semibold text-blue-800">
                      {colName}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {typeof missing_count === "number"
                        ? missing_count.toLocaleString("hr-HR")
                        : "0"}
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      {typeof missing_percentage === "number"
                        ? missing_percentage.toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EDA;
