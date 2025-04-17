import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";

type Mode = "Manual" | "AI" | "Auto";

export default function Status() {
  const [mode, setMode] = useState<Mode>("Manual");
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [batteryLevel, _setBatteryLevel] = useState(3); // 0-4

  const toggleModeSelect = () => {
    setShowModeSelect(!showModeSelect);
  };

  const selectMode = (newMode: Mode) => {
    setMode(newMode);
    setShowModeSelect(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          onClick={toggleModeSelect}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <h2 style={{ margin: 0 }}>{mode}</h2>
          <FaChevronDown style={{ marginLeft: 8 }} />
        </div>

        {showModeSelect && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              backgroundColor: "#242424",
              border: "1px solid #f7fcfa",
              borderRadius: 4,
              padding: 8,
              zIndex: 10,
            }}
          >
            {["Manual", "AI", "Auto"].map((m) => (
              <div
                key={m}
                onClick={() => selectMode(m as Mode)}
                style={{
                  padding: "8px 16px",
                  cursor: "pointer",
                  backgroundColor: mode === m ? "#344256" : "transparent",
                }}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            border: "2px solid #f7fcfa",
            borderRadius: "4px",
            padding: 2,
            display: "flex",
            alignItems: "flex-end",
            height: 20,
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: "100%",
                backgroundColor: i < batteryLevel ? "#5691CC" : "transparent",
                borderRadius: 1,
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: 3,
            height: 10,
            backgroundColor: "#f7fcfa",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>
    </div>
  );
}
