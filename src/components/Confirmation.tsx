import { JerseySelection } from "../types/jersey";

interface ConfirmationProps {
  selection: JerseySelection;
  onNewSelection: () => void;
}

export const Confirmation = ({
  selection,
  onNewSelection,
}: ConfirmationProps) => {
  return (
    <div className="form-card">
      <h2
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 800,
          color: "var(--gold)",
        }}
      >
        Selection Recorded
      </h2>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong style={{ color: "var(--gold)" }}>Name:</strong>
          <span>{selection.jersey.name}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong style={{ color: "var(--gold)" }}>Opinion:</strong>
          <span>{selection.opinion || "—"}</span>
        </div>
      </div>

      <button
        onClick={onNewSelection}
        className="confirm-btn"
        style={{ marginTop: 18 }}
      >
        Make New Selection
      </button>
    </div>
  );
};
