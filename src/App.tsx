import { useState, useEffect, useRef } from "react";
import { MoveControl, StrafeControl } from "./Joystick";
import Button from "./Button";
import Status from "./Status";
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
import RobotConnection from "./robot-connection";

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

function ConnectionScreen({ onConnect }: { onConnect: (ip: string) => void }) {
  const [ip, setIp] = useState("");

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
        }}
      >
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter Robot IP"
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <Button
          onClick={() => onConnect(ip)}
          disabled={!ip}
          style={{
            padding: "10px",
            fontSize: "16px",
          }}
        >
          Connect
        </Button>
      </div>
    </div>
  );
}

function ControlScreen({
  onDisconnect,
  ip,
}: {
  onDisconnect: () => void;
  ip: string;
}) {
  const connection = useRef(new RobotConnection("192.168.12.1"));
  const move = useRef([0, 0]);
  const strafe = useRef(0);

  useEffect(() => {
    const moveTimer = setInterval(() => {
      const [z, x] = move.current;
      const y = strafe.current;
      const ySign = Math.sign(y);
      const curvedY = (1 - Math.pow(1 - Math.abs(y), 4)) * ySign;

      if (y === 0 && x === 0 && z === 0) {
        return;
      }

      console.log(-x, -curvedY, -z);
      connection.current.move(-x, -curvedY, -z);
    }, 100);

    return () => {
      connection.current.dispose();
      clearInterval(moveTimer);
    };
  }, []);

  function onEmote(id: number) {
    connection.current.emote(id);
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
  const [connected, setConnected] = useState(false);
  const [robotIp, setRobotIp] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Could not enter fullscreen mode:", err));
    }
  };

  const handleConnect = (ip: string) => {
    console.log("connect", ip);
    setRobotIp(ip);
    setConnected(true);
    enterFullscreen();
  };

  const handleDisconnect = () => {
    setConnected(false);
    setRobotIp("");
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && connected) {
        handleDisconnect();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [connected]);

  return connected ? (
    <ControlScreen onDisconnect={handleDisconnect} ip={robotIp} />
  ) : (
    <ConnectionScreen onConnect={handleConnect} />
  );
}

export default App;
