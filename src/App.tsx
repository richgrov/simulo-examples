import { useState, useEffect } from "react";
import { MoveControl, StrafeControl } from "./Joystick";
import Button from "./Button";
import Status from "./Status";

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
} from "react-icons/fa6";
import { GiJumpingDog } from "react-icons/gi";
import { TbStretching } from "react-icons/tb";
import { LuMusic2, LuMusic3 } from "react-icons/lu";

function Emotes() {
  return (
    <div style={{ overflow: "auto", flex: "1" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridGap: 8,
        }}
      >
        <Button>
          Walk
          <FaPersonWalking size={25} />
        </Button>
        <Button>
          Run
          <FaPersonRunning size={25} />
        </Button>
        <Button>
          Shake
          <FaHandshake size={25} />
        </Button>
        <Button>
          Heart
          <FaHeart size={25} />
        </Button>
        <Button>
          Beg
          <FaPersonPraying size={25} />
        </Button>
        <Button>
          Pounce
          <FaArrowRight size={25} />
        </Button>
        <Button>
          Jump
          <GiJumpingDog size={25} />
        </Button>
        <Button>
          Sit
          <FaChair size={25} />
        </Button>
        <Button>
          Stretch
          <TbStretching size={25} />
        </Button>
        <Button>
          Roll
          <FaArrowsSpin size={25} />
        </Button>
        <Button>
          Dance 1<LuMusic2 size={25} />
        </Button>
        <Button>
          Dance 2<LuMusic3 size={25} />
        </Button>
        <Button>
          Flip
          <FaHurricane size={25} />
        </Button>
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

function ControlScreen({ onDisconnect }: { onDisconnect: () => void }) {
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
          <Emotes />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            style={{
              color: "orange",
              borderColor: "orange",
              flex: "1 1 auto",
            }}
          >
            SOFT STOP
          </Button>
          <Button
            style={{
              color: "red",
              borderColor: "red",
              flex: "1 1 auto",
            }}
            onClick={onDisconnect}
          >
            HARD STOP
          </Button>
        </div>
        <MoveControl />
        <h3>Strafe</h3>
        <StrafeControl />
      </div>
    </div>
  );
}

function App() {
  const [connected, setConnected] = useState(false);
  const [_robotIp, setRobotIp] = useState("");
  const [_isFullscreen, setIsFullscreen] = useState(false);

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
    <ControlScreen onDisconnect={handleDisconnect} />
  ) : (
    <ConnectionScreen onConnect={handleConnect} />
  );
}

export default App;
