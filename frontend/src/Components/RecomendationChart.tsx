import React, { useState, useEffect } from "react";
import axios from "axios";

interface RecommendationChartProps {
  contentId: string;
}

const RecommendationChart: React.FC<RecommendationChartProps> = ({
  contentId,
}) => {
  const [collabRecommendations, setCollabRecommendations] = useState<string[]>(
    []
  );
  const [contentRecommendations, setContentRecommendations] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) return;

    setLoading(true);
    setError(null);

    const fetchCollabRecommendations = axios.get<string[]>(
      `http://localhost:5000/api/Recommender/collabRecommendation/${contentId}`
    );
    const fetchContentRecommendations = axios.get<string[]>(
      `http://localhost:5000/api/Recommender/contentRecommendation/${contentId}`
    );

    Promise.allSettled([
      fetchCollabRecommendations,
      fetchContentRecommendations,
    ])
      .then((results) => {
        const [collabResult, contentResult] = results;

        if (collabResult.status === "fulfilled") {
          setCollabRecommendations(collabResult.value.data);
        } else {
          setCollabRecommendations([]);
        }

        if (contentResult.status === "fulfilled") {
          setContentRecommendations(contentResult.value.data);
        } else {
          setContentRecommendations([]);
        }

        if (
          collabResult.status === "rejected" &&
          contentResult.status === "rejected"
        ) {
          setError("Error fetching recommendations");
        }
      })
      .catch(() => setError("Unexpected error"))
      .finally(() => setLoading(false));
  }, [contentId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Recommendations for {contentId}
      </h2>

      {loading && <p>Loading recommendations...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <table className="border-collapse border border-gray-300 w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">
                Recommendation Type
              </th>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="border border-gray-300 p-2">
                  #{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-bold">
                Collaborative
              </td>
              {collabRecommendations.map((id, i) => (
                <td key={i} className="border border-gray-300 p-2">
                  {id}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-bold">
                Content-Based
              </td>
              {contentRecommendations.map((id, i) => (
                <td key={i} className="border border-gray-300 p-2">
                  {id}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecommendationChart;
