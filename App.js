import React, { useState } from "react";
import "./App.css";
import Notifications from "./components/notifications/Notifications";

const selections = [
  {
    label: "Instant Alfred",
    description: "Create your itinerary in seconds—customized instantly to your preferences."
  },
  {
    label: "Alfred Plus",
    description: "Let Alfred build a smarter, more complex itinerary in the background—you'll be notified when it's ready."
  },
  {
    label: "Alfred Multi-City",
    description: "Plan seamless itineraries across multiple cities by air, land, or sea."
  },
  {
    label: "Alfred Global Voyager",
    description: "Design international journeys that span countries, cultures, and borders."
  },
  {
    label: "Today with Alfred",
    description: "Get a real-time itinerary tailored for your current location and travel day."
  },
  {
    label: "Reel to Real",
    description: "Upload your travel videos and let Alfred turn them into inspired trips."
  }
];

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="app-bg">
      <div className="app-header">
        <h1 className="app-title">Itinerary Builder</h1>
        <Notifications />
      </div>
      <div className="selection-list">
        {selections.map((item, idx) => (
          <div key={item.label} className="selection-section">
            <button
              className={`selection-btn${selected === idx ? " selected" : ""}`}
              onClick={() => setSelected(idx)}
            >
              <div className="selection-content">
                <div className="selection-text">
                  <h3 className="selection-title">{item.label}</h3>
                  <p className="selection-description">{item.description}</p>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
