import { useEffect } from "react";

const STYLES = {
  error:   { bg: "#fff0f0", border: "#fc8181", color: "#c53030" },
  success: { bg: "#f0fff4", border: "#68d391", color: "#276749" },
  warning: { bg: "#fffbeb", border: "#f6ad55", color: "#744210" },
};

/**
 * Alert banner that auto-dismisses after `duration` ms (default 5 s).
 * Pass message="" to hide it.
 */
function Alert({ message, type = "error", onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, onClose, duration]);

  if (!message) return null;

  const s = STYLES[type] ?? STYLES.error;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        marginBottom: "14px",
        border: `1px solid ${s.border}`,
        borderRadius: "6px",
        backgroundColor: s.bg,
        color: s.color,
        fontSize: "0.875rem",
        lineHeight: 1.5,
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: s.color,
          fontSize: "18px",
          lineHeight: 1,
          padding: "0 0 0 14px",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default Alert;
