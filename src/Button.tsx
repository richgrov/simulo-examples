import { useState, useRef, useEffect } from "react";

export default function Button(props: React.ComponentProps<"button">) {
  const [isPressed, setIsPressed] = useState(false);
  const [fillPercentage, setFillPercentage] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(true);
    setFillPercentage(0);

    const startTime = Date.now();
    const holdDuration = 500;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newFillPercentage = Math.min(100, (elapsed / holdDuration) * 100);
      setFillPercentage(newFillPercentage);

      if (newFillPercentage >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (props.onClick)
          timeoutRef.current = window.setTimeout(
            () => props.onClick?.(e as any),
            0
          );
      }
    }, 16);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    setFillPercentage(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 0",
    position: "relative",
    overflow: "hidden",
    userSelect: "none",
    WebkitUserSelect: "none",
    ...props.style,
  };

  const fillStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: `${fillPercentage}%`,
    height: "100%",
    backgroundColor: "rgba(0, 123, 255, 0.3)",
    transition: "height 0.05s linear",
    zIndex: -1,
  };

  return (
    <button
      {...props}
      style={style}
      onClick={undefined}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      <div style={fillStyle} />
      {props.children}
    </button>
  );
}
