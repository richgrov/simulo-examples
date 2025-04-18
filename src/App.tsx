import { useState, useEffect, useRef } from "react";
import { MoveControl, StrafeControl } from "./Joystick";
import Button from "./Button";
import Status from "./Status";
import RobotConnection from "./robot-connection";
//import RobotConnection from "./mock-connection";
import * as emotes from "./Emotes";

import {
  FaArrowRight,
  FaArrowsSpin,
  FaChair,
  FaHandshake,
  FaHeart,
  FaHurricane,
  FaPersonPraying,
  FaPersonRunning,
  FaPersonWalking,
  FaSuitcaseMedical,
  FaWorm,
} from "react-icons/fa6";
import { GiJumpingDog } from "react-icons/gi";
import { TbStretching } from "react-icons/tb";
import { LuMusic2, LuMusic3 } from "react-icons/lu";

function Emotes({ onEmote }: { onEmote: (id: number) => void }) {
  function EmoteButton(name: string, id: number, icon: JSX.Element) {
    return (
      <Button onClick={() => onEmote(id)}>
        {name}
        {icon}
      </Button>
    );
  }
  return (
    <div style={{ overflow: "auto", flex: "1" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridGap: 8,
        }}
      >
        {EmoteButton("Walk", emotes.WALK, <FaPersonWalking size={25} />)}
        <Button>
          (X) Run
          <FaPersonRunning size={25} />
        </Button>
        {EmoteButton("Shake", emotes.HELLO, <FaHandshake size={25} />)}
        {EmoteButton("Heart", emotes.HEART, <FaHeart size={25} />)}
        <Button>
          (X) Beg
          <FaPersonPraying size={25} />
        </Button>
        {EmoteButton("Pounce", emotes.POUNCE, <FaArrowRight size={25} />)}
        {EmoteButton("Jump", emotes.JUMP, <GiJumpingDog size={25} />)}
        {EmoteButton("Sit", emotes.SIT, <FaChair size={25} />)}
        {EmoteButton("Stretch", emotes.STRETCH, <TbStretching size={25} />)}
        {EmoteButton("Roll", emotes.ROLL, <FaArrowsSpin size={25} />)}
        {EmoteButton("Dance 1", emotes.DANCE1, <LuMusic2 size={25} />)}
        {EmoteButton("Dance 2", emotes.DANCE2, <LuMusic3 size={25} />)}
        {EmoteButton("Flip", emotes.FRONT_FLIP, <FaHurricane size={25} />)}
        {EmoteButton("Wiggle", emotes.WIGGLE, <FaWorm size={25} />)}
        {EmoteButton(
          "Recover",
          emotes.RECOVER,
          <FaSuitcaseMedical size={25} />
        )}
      </div>
    </div>
  );
}

function ConnectionScreen({
  onConnect,
}: {
  onConnect: (connection: RobotConnection) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const connection = new RobotConnection(
        "192.168.12.1",
        () => {
          setConnecting(false);
          onConnect(connection);
        },
        (error) => {
          setError(
            `Connection error: ${error?.message || JSON.stringify(error)}`
          );
          setConnecting(false);
        }
      );
    } catch (err: any) {
      setError(`Failed to connect: ${err?.message || JSON.stringify(err)}`);
      setConnecting(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>Connect to Robot</h1>
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Button
          onClick={handleConnect}
          disabled={connecting}
          style={{
            padding: "inherit 10px",
          }}
        >
          {connecting ? "Connecting..." : "Hold to Connect"}
        </Button>
      </div>
    </div>
  );
}

function ControlScreen({
  connection,
  onDisconnect,
}: {
  connection: RobotConnection;
  onDisconnect: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef(connection);
  const move = useRef([0, 0]);
  const strafe = useRef(0);

  useEffect(() => {
    connectionRef.current.errorHandler = (err) => {
      setError(`Connection error: ${err?.message || "Connection lost"}`);
    };

    const moveTimer = setInterval(() => {
      const [z, x] = move.current;
      const y = strafe.current;
      const ySign = Math.sign(y);
      const curvedY = (1 - Math.pow(1 - Math.abs(y), 4)) * ySign;

      if (y === 0 && x === 0 && z === 0) {
        return;
      }

      try {
        connectionRef.current.move(-x, -curvedY, -z);
      } catch (err: any) {
        setError(`Movement error: ${err?.message || JSON.stringify(err)}`);
      }
    }, 100);

    return () => {
      connectionRef.current.dispose();
      clearInterval(moveTimer);
    };
  }, []);

  function onEmote(id: number) {
    try {
      connectionRef.current.emote(id);
    } catch (err: any) {
      setError(`Emote error: ${err?.message || JSON.stringify(err)}`);
    }
  }

  function onMove(x: number, y: number) {
    move.current = [x, y];
  }

  function onStrafe(x: number) {
    strafe.current = x;
  }

  return (
    <div
      style={{
        maxWidth: "90%",
        margin: "0 auto",
        height: "98vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          margin: "10px 0",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {error && (
          <div
            style={{
              color: "red",
              padding: "5px 10px",
              backgroundColor: "rgba(255,0,0,0.1)",
              borderRadius: "4px",
            }}
          >
            {error}
            <button
              style={{
                marginLeft: "10px",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}
        <Status />
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Emotes onEmote={onEmote} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            style={{
              color: "orange",
              borderColor: "orange",
              flex: "1 1 auto",
            }}
            onClick={() => onEmote(emotes.DAMP)}
          >
            SOFT STOP
          </Button>
          <Button
            style={{
              color: "red",
              borderColor: "red",
              flex: "1 1 auto",
            }}
          >
            HARD STOP
          </Button>
        </div>
        <MoveControl onMove={onMove} />
        <h3>Strafe</h3>
        <StrafeControl onStrafe={onStrafe} />
      </div>
    </div>
  );
}

function App() {
  const [connection, setConnection] = useState<RobotConnection | null>(null);
  const [_isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Could not enter fullscreen mode:", err));
    }
  };

  const handleConnect = (newConnection: RobotConnection) => {
    setConnection(newConnection);
    enterFullscreen();
  };

  const handleDisconnect = () => {
    if (connection) {
      connection.dispose();
    }
    setConnection(null);
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && connection) {
        handleDisconnect();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [connection]);

  return connection ? (
    <ControlScreen connection={connection} onDisconnect={handleDisconnect} />
  ) : (
    <ConnectionScreen onConnect={handleConnect} />
  );
}

export default App;
