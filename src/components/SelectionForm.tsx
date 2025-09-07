import { useState, FormEvent } from "react";
import { Jersey, JerseySelection } from "../types/jersey";

interface SelectionFormProps {
  selectedJersey: Jersey;
  onSubmit: (selection: JerseySelection) => void;
}

export const SelectionForm = ({
  selectedJersey,
  onSubmit,
}: SelectionFormProps) => {
  const [playerName, setPlayerName] = useState("");
  const [opinion, setOpinion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selection: JerseySelection = {
      jersey: selectedJersey,
      playerName: playerName.trim(),
      opinion: opinion.trim(),
    };

    // Send data to a Google Apps Script Web App endpoint (deployed as "Anyone, even anonymous")
    // Provide the deployment URL via Vite env var VITE_APPS_SCRIPT_URL or replace the placeholder below.
    const APPS_SCRIPT_URL =
      (import.meta as any).env.VITE_APPS_SCRIPT_URL ||
      "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec";

    // Use FormData to avoid CORS preflight. The Apps Script doPost handler will read e.parameter.
    const formData = new FormData();
    formData.append("jerseyName", selectedJersey.name);
    formData.append("playerName", playerName.trim());
    formData.append("opinion", opinion.trim());

    try {
      setSubmitting(true);

      const resp = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }

      // Try to parse JSON response from Apps Script (expected { status: 'success' })
      const json = await resp.json().catch(() => null);
      if (json && json.status !== "success") {
        throw new Error("Server returned an unexpected response");
      }

      // Local onSubmit to update app state / show confirmation
      onSubmit(selection);

      alert("✅ Response recorded!");

      // Reset local form fields
      setPlayerName("");
      setOpinion("");
    } catch (err) {
      console.error(err);
      alert(
        "There was a problem submitting your response. Please try again or check your deployment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: {
      maxWidth: 560,
      margin: "2rem auto",
      padding: 12,
    },
    card: {
      padding: 20,
      borderRadius: 14,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(245,245,250,0.72))",
      boxShadow: "0 10px 30px rgba(10,10,20,0.12)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255,255,255,0.6)",
    },
    header: {
      display: "flex",
      gap: 16,
      alignItems: "center",
      marginBottom: 12,
    },
    preview: {
      width: 110,
      height: 146,
      borderRadius: 10,
      overflow: "hidden",
      flexShrink: 0,
      boxShadow: "0 6px 18px rgba(2,6,23,0.12)",
      border: "1px solid rgba(0,0,0,0.06)",
      background: selectedJersey.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    titleGroup: {
      flex: 1,
    },
    title: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "#0f172a",
    },
    desc: {
      margin: "6px 0 0",
      color: "#475569",
      fontSize: 13,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 10,
    },
    input: {
      height: 40,
      padding: "8px 10px",
      borderRadius: 8,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(255,255,255,0.9)",
      outline: "none",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
    },
    textarea: {
      padding: 10,
      borderRadius: 8,
      border: "1px solid rgba(15,23,42,0.08)",
      minHeight: 96,
      resize: "vertical",
      background: "rgba(255,255,255,0.9)",
    },
    actions: {
      display: "flex",
      gap: 12,
      marginTop: 8,
    },
    btnPrimary: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      background: "linear-gradient(90deg,#0ea5e9,#6366f1)",
      color: "white",
      fontWeight: 600,
      boxShadow: "0 8px 20px rgba(99,102,241,0.18)",
      transition: "transform .12s ease, box-shadow .12s ease",
    },
    btnSecondary: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      border: "1px solid rgba(15,23,42,0.06)",
      background: "white",
      color: "#334155",
      cursor: "pointer",
    },
    badge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 700,
      color: "#0b1220",
      background: "rgba(99,102,241,0.12)",
    },
  } as const;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.preview}>
            {selectedJersey.frontImage ? (
              <img
                src={selectedJersey.frontImage}
                alt={`${selectedJersey.name} front`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ color: "#fff", fontWeight: 700 }}>
                {selectedJersey.name}
              </div>
            )}
          </div>

          <div style={styles.titleGroup}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={styles.title}>{selectedJersey.name}</h3>
              <span style={styles.badge}>New</span>
            </div>
            <p style={styles.desc}>{selectedJersey.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label
              htmlFor="playerName"
              style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}
            >
              Player Name (Optional)
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label
              htmlFor="opinion"
              style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}
            >
              Your Opinion
            </label>
            <textarea
              id="opinion"
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="Share your thoughts about this design..."
              rows={4}
              style={styles.textarea}
            />
          </div>

          <div style={styles.actions}>
            <button
              type="submit"
              style={styles.btnPrimary}
              disabled={submitting}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "translateY(1px)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "")}
            >
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => {
                setPlayerName("");
                setOpinion("");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
