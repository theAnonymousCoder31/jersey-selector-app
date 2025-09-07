import { useState } from "react";
import { Jersey } from "../types/jersey";

interface JerseyCardProps {
  jersey: Jersey;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const getDarkerColor = (color: string): string => {
  const hex = color.replace("#", "");
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
  return `rgb(${r}, ${g}, ${b})`;
};

export const JerseyCard = ({
  jersey,
  isSelected,
  onSelect,
}: JerseyCardProps) => {
  const [showFront, setShowFront] = useState(true);

  const styles = {
    card: {
      width: "100%",
      maxWidth: 315, // reduced from 420 (≈25% smaller)
      padding: 10, // reduced padding
      borderRadius: 12,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,247,250,0.96))",
      boxShadow:
        "0 14px 36px rgba(2,6,23,0.10), 0 0 28px rgba(99,102,241,0.05)",
      border: "1px solid rgba(15,23,42,0.04)",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
    },
    toggleGroup: {
      display: "inline-flex",
      background: "rgba(15,23,42,0.03)",
      padding: 6,
      borderRadius: 999,
      gap: 8,
      marginBottom: 10,
    },
    toggleBtn: (active = false) => ({
      padding: "8px 12px",
      borderRadius: 999,
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 13,
      color: active ? "white" : "#475569",
      background: active
        ? "linear-gradient(90deg,#6366f1,#0ea5e9)"
        : "transparent",
      boxShadow: active ? "0 6px 16px rgba(99,102,241,0.14)" : "none",
    }),
    imageContainer: {
      width: "100%",
      paddingTop: "125%" /* 3:4-ish aspect ratio */,
      borderRadius: 10,
      overflow: "hidden",
      background: jersey.color,
      position: "relative" as const,
      display: "block",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    image: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
      display: "block",
      transition: "transform 420ms, opacity 320ms",
    },
    title: {
      marginTop: 10,
      marginBottom: 6,
      fontSize: 16, // reduced font size
      fontWeight: 800,
      color: "#0f172a",
      textAlign: "center" as const,
    },
    desc: {
      margin: 0,
      color: "#64748b",
      fontSize: 12,
      textAlign: "center" as const,
      maxWidth: "100%",
      padding: "0 6px",
    },
    selectBtn: (selected = false) => ({
      marginTop: 10,
      width: "100%",
      maxWidth: 240, // reduced from 320
      height: 40, // slightly smaller
      borderRadius: 8,
      border: selected ? "none" : "1px solid rgba(15,23,42,0.06)",
      background: selected ? "linear-gradient(90deg,#6366f1,#0ea5e9)" : "white",
      color: selected ? "white" : "#0f172a",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: selected
        ? "0 10px 28px rgba(99,102,241,0.18)"
        : "0 4px 12px rgba(2,6,23,0.03)",
    }),
  } as const;

  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div style={styles.toggleGroup}>
          <button
            type="button"
            style={styles.toggleBtn(showFront)}
            onClick={() => setShowFront(true)}
            aria-pressed={showFront}
          >
            Front
          </button>
          <button
            type="button"
            style={styles.toggleBtn(!showFront)}
            onClick={() => setShowFront(false)}
            aria-pressed={!showFront}
          >
            Back
          </button>
        </div>
      </div>

      <div style={styles.imageContainer}>
        {(showFront && jersey.frontImage) || (!showFront && jersey.backImage) ? (
          <img
            src={showFront ? jersey.frontImage : jersey.backImage}
            alt={`${jersey.name} ${showFront ? "front" : "back"}`}
            style={styles.image}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: showFront ? jersey.color : getDarkerColor(jersey.color),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {showFront ? "Front View" : "Back View"}
          </div>
        )}
      </div>

      <h3 style={styles.title}>{jersey.name}</h3>
      <p style={styles.desc}>{jersey.description}</p>

      <button
        type="button"
        style={styles.selectBtn(isSelected)}
        onClick={() => onSelect(jersey.id)}
      >
        {isSelected ? "✓ Selected" : "Select This Jersey"}
      </button>
    </div>
  );
};
