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

function App() {
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

export default App;
