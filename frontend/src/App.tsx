import { useState } from "react";
import "./App.css";
import RecommendationChart from "./Components/RecomendationChart";

function App() {
  const [inputId, setInputId] = useState("");
  return (
    <>
      <h1>For example, try 6152652267138213180</h1>
      <p>
        Some of the articles do not have enough data to return <br />
        recommendations depending on the algorithm used.
      </p>
      <input
        type="text"
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
        placeholder="Enter ContentId"
      />
      <RecommendationChart contentId={inputId} />
    </>
  );
}

export default App;
