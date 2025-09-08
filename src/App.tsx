import { useState, useEffect } from "react";
import { Jersey, JerseySelection } from "./types/jersey";
import { JerseyCarousel } from "./components/Carousel";
import { SelectionForm } from "./components/SelectionForm";
import { Confirmation } from "./components/Confirmation";

const jerseyData: Jersey[] = [
  {
    id: "d1",
    name: "Design 1",
    description: "Sleek modern home design",
    color: "#1e40af",
    frontImage: "/images/D1_Front.png",
    backImage: "/images/D1_Back.png",
  },
  {
    id: "d2",
    name: "Design 2",
    description: "Bold alternate styling",
    color: "#dc2626",
    frontImage: "/images/D2_Front.png",
    backImage: "/images/D2_Back.png",
  },
  {
    id: "d3",
    name: "Design 3",
    description: "Minimal third-kit aesthetic",
    color: "#059669",
    frontImage: "/images/D3_Front.png",
    backImage: "/images/D3_Back.png",
  },
  {
    id: "d4",
    name: "Design 4",
    description: "Retro inspired look",
    color: "#7c3aed",
    frontImage: "/images/D4_Front.png",
    backImage: "/images/D4_Back.png",
  },
  {
    id: "d5",
    name: "Design 5",
    description: "Exclusive limited edition",
    color: "#ea580c",
    frontImage: "/images/D5_Front.png",
    backImage: "/images/D5_Back.png",
  },
];

export default function App() {
  const [selectedJerseyId, setSelectedJerseyId] = useState<string | null>(null);
  const [selection, setSelection] = useState<JerseySelection | null>(null);

  // Voting state (multi-select). Persist locally so user sees their votes across visits.
  const [votes, setVotes] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jerseyVotes");
      if (raw) setVotes(JSON.parse(raw));
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const toggleVote = (id: string) => {
    setVotes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitVotes = () => {
    try {
      localStorage.setItem("jerseyVotes", JSON.stringify(votes));
      alert(
        `Thanks — your ${votes.length} vote(s) have been recorded locally.`
      );
    } catch (e) {
      console.error(e);
      alert("Unable to save votes locally.");
    }
  };

  const clearVotes = () => {
    setVotes([]);
    localStorage.removeItem("jerseyVotes");
  };

  const handleSelectJersey = (id: string) => {
    setSelectedJerseyId(id);
    setSelection(null);
  };

  const handleSubmitSelection = (selection: JerseySelection) => {
    setSelection(selection);
  };

  const handleNewSelection = () => {
    setSelectedJerseyId(null);
    setSelection(null);
  };

  const selectedJersey = selectedJerseyId
    ? jerseyData.find((j) => j.id === selectedJerseyId)
    : null;

  return (
    <div className="app-shell">
      <div className="app-card">
        <div className="header" style={{ alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/images/Red_Pride_Logo_GOld.jpg"
              alt="Red Pride Logo"
              style={{
                width: 100,
                height: 100,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
            <div>
              <h1 className="title" style={{ margin: 0 }}>
                Jersey Selection
              </h1>
              <div className="subtitle muted">
                Pick a jersey and customize it
              </div>
            </div>
          </div>
        </div>

        {/* Intro heading + short app intro */}
        <div style={{ marginTop: 6, marginBottom: 12 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              color: "var(--gold)",
            }}
          >
            New Look, Same Passion
          </h2>
          <p
            className="muted"
            style={{
              marginTop: 8,
              marginBottom: 0,
              fontSize: 13,
            }}
          >
            Choose your favorite designs from our shortlist. You can vote for
            multiple jerseys — the ones with the most votes will be selected as
            the final look.
          </p>
        </div>

        <JerseyCarousel
          jerseys={jerseyData}
          selectedJerseyId={selectedJerseyId}
          onSelectJersey={handleSelectJersey}
        />

        {!selection && !selectedJersey && (
          <div className="text-center muted" style={{ marginTop: 20 }}>
            Please select a jersey to continue
          </div>
        )}

        {selectedJersey && !selection && (
          <div style={{ marginTop: 20 }}>
            <SelectionForm
              selectedJersey={selectedJersey}
              onSubmit={handleSubmitSelection}
            />
          </div>
        )}

        {selection && (
          <div style={{ marginTop: 20 }}>
            <Confirmation
              selection={selection}
              onNewSelection={handleNewSelection}
            />
          </div>
        )}
      </div>
    </div>
  );
}
