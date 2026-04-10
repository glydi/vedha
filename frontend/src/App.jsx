import { useState } from "react";
import "./App.css";


function App() {
  const [mode, setMode] = useState("home");
  const [code, setCode] = useState("");

  const handleInitSnippet = async () => {
    setMode("create");
    try {
      const text = await navigator.clipboard.readText();
      if (text) setCode(text);
    } catch (err) {
      console.warn("Auto-paste failed:", err);
    }
  };

  const handleSave = async () => {
    if (!code.trim()) return alert("Snippet cannot be empty.");

    try {
      const response = await fetch("http://localhost:8080/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: code }),
      });

      if (response.ok) {
        alert("Snippet saved successfully!");
        setMode("home");
        setCode("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.message || "Failed to save snippet"}`);
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Backend at localhost:8080 is unreachable.");
    }
  };

  const handleManualPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setCode(text);
    } catch (err) {
      alert("Please allow clipboard access.");
    }
  };

  return (
    <div>
      {mode === "home" && (
        <div id="center">
          <button className="primary-btn" onClick={handleInitSnippet}>
            Init Snippet
          </button>
        </div>
      )}

      {mode === "create" && (
        <div id="center">
          <h2>Create Snippet</h2>

          <textarea
            className="codein"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
          />

          <div className="button-group">
            <button className="secondary-btn" onClick={handleManualPaste}>
              Paste from Clipboard
            </button>

            <button className="primary-btn" onClick={handleSave}>
              Save Snippet
            </button>

            <button className="secondary-btn" onClick={() => setMode("home")}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




export default App;
