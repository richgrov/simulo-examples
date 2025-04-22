import { useEffect, useRef, useState } from "react";
import { vibrate } from "@tauri-apps/plugin-haptics";

const WIDTH = 400;
const HEIGHT = 400;

function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}

export function MoveControl(props: { onMove: (x: number, y: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef([0, 0]);
  const joystickPos = useRef([0, 0]);
  const lastMultiple = useRef([0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let run = true;

    function loop() {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#344256";
      circle(ctx, WIDTH / 2, HEIGHT / 2, WIDTH / 2 - 16);
      circle(ctx, WIDTH / 2, HEIGHT / 2, WIDTH / 2 - 64);
      line(ctx, WIDTH / 2, 0, WIDTH / 2, HEIGHT);
      line(ctx, 0, HEIGHT / 2, WIDTH, HEIGHT / 2);

      ctx.strokeStyle = "#f7fcfa";
      circle(ctx, WIDTH / 2, HEIGHT / 2, WIDTH / 2 - 48);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#5691CC";
      const [joyX, joyY] = joystickPos.current;
      circle(ctx, WIDTH / 2 + joyX, HEIGHT / 2 + joyY, 32);
      circle(ctx, WIDTH / 2 + joyX, HEIGHT / 2 + joyY, 48);

      if (run) {
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);

    return () => {
      run = false;
    };
  }, []);

  function dragStart(
    currentTarget: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) {
    vibrate(1);

    setDragging(true);
    const rect = currentTarget.getBoundingClientRect();
    const dx = clientX - rect.left - WIDTH / 2;
    const dy = clientY - rect.top - HEIGHT / 2;
    dragOffset.current = [dx, dy];
  }

  function drag(
    currentTarget: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) {
    if (!dragging) {
      return;
    }

    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left - WIDTH / 2 - dragOffset.current[0];
    const y = clientY - rect.top - HEIGHT / 2 - dragOffset.current[1];
    const xScaleFactor = WIDTH / rect.width;
    const yScaleFactor = HEIGHT / rect.height;

    const pixelX = x * xScaleFactor;
    const pixelY = y * yScaleFactor;

    const xMultiple = Math.trunc(x / 10);
    const yMultiple = Math.trunc(y / 10);

    if (xMultiple !== lastMultiple.current[0]) {
      if (xMultiple === 0) {
        vibrate(25);
      }
      lastMultiple.current[0] = xMultiple;
    }

    if (yMultiple !== lastMultiple.current[1]) {
      if (yMultiple === 0) {
        vibrate(25);
      }
      lastMultiple.current[1] = yMultiple;
    }

    joystickPos.current = [pixelX, pixelY];
    props.onMove((x / rect.width) * 2, (y / rect.width) * 2);
  }

  function dragEnd() {
    setDragging(false);
    joystickPos.current = [0, 0];
    props.onMove(0, 0);
  }

  return (
    <canvas
      width={WIDTH}
      height={HEIGHT}
      ref={canvasRef}
      onTouchStart={(e) =>
        dragStart(e.currentTarget, e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchMove={(e) =>
        drag(e.currentTarget, e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchEnd={dragEnd}
      onMouseDown={(e) => dragStart(e.currentTarget, e.clientX, e.clientY)}
      onMouseMove={(e) => drag(e.currentTarget, e.clientX, e.clientY)}
      onMouseUp={dragEnd}
    ></canvas>
  );
}

export function StrafeControl(props: { onStrafe: (x: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef(0);
  const sliderPos = useRef(0);
  const lastMultiple = useRef(0);

  const STRAFE_HEIGHT = 40;
  const SLIDER_WIDTH = 20;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let run = true;

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw track
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#344256";

      const actualWidth = canvas.width;
      const trackPadding = actualWidth * 0.05;

      ctx.beginPath();
      ctx.roundRect(
        trackPadding,
        12,
        actualWidth - trackPadding * 2,
        STRAFE_HEIGHT - 12 * 2,
        20
      );
      ctx.stroke();
      line(
        ctx,
        trackPadding + 10,
        STRAFE_HEIGHT / 2,
        actualWidth - trackPadding - 10,
        STRAFE_HEIGHT / 2
      );

      // Slider head
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#5691CC";
      ctx.beginPath();

      const centerX = actualWidth / 2;
      const scaleFactor = actualWidth / WIDTH;
      const scaledPos = sliderPos.current * scaleFactor;

      ctx.roundRect(
        centerX + scaledPos - SLIDER_WIDTH / 2,
        2,
        SLIDER_WIDTH,
        STRAFE_HEIGHT - 4,
        6
      );
      ctx.stroke();

      if (run) {
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);

    return () => {
      run = false;
    };
  }, []);

  function dragStart(currentTarget: HTMLCanvasElement, clientX: number) {
    setDragging(true);
    const rect = currentTarget.getBoundingClientRect();
    const offsetX = clientX - rect.left - WIDTH / 2;
    dragOffset.current = offsetX;
    vibrate(1);
  }

  function drag(currentTarget: HTMLCanvasElement, clientX: number) {
    if (!dragging) {
      return;
    }

    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left - WIDTH / 2 - dragOffset.current;
    const scaleFactor = WIDTH / rect.width;

    const pixelX = x * scaleFactor;
    const multiple = Math.trunc(pixelX / 10);

    if (multiple !== lastMultiple.current) {
      if (multiple === 0) {
        vibrate(1);
      }
      lastMultiple.current = multiple;
    }

    sliderPos.current = pixelX;
    props.onStrafe((x / rect.width) * 2);
  }

  function dragEnd() {
    setDragging(false);
    sliderPos.current = 0;
    props.onStrafe(0);
  }

  return (
    <canvas
      width={WIDTH}
      height={STRAFE_HEIGHT}
      ref={canvasRef}
      onTouchStart={(e) => dragStart(e.currentTarget, e.touches[0].clientX)}
      onTouchMove={(e) => drag(e.currentTarget, e.touches[0].clientX)}
      onTouchEnd={dragEnd}
      onMouseDown={(e) => dragStart(e.currentTarget, e.clientX)}
      onMouseMove={(e) => drag(e.currentTarget, e.clientX)}
      onMouseUp={dragEnd}
    ></canvas>
  );
}
