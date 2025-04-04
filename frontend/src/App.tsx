import { useState } from "react";
import "./App.css";
import RecommendationChart from "./Components/RecomendationChart";

function App() {
  const [inputId, setInputId] = useState("");
  return (
    <>
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
