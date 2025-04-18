import { fetch } from "@tauri-apps/plugin-http";
import CryptoJS from "crypto-js";
import forge from "node-forge";

export default class RobotConnection {
  private connection: RTCPeerConnection;
  private channel: RTCDataChannel;
  private heartbeatTimer: NodeJS.Timeout | undefined;
  public errorHandler: (error: any) => void = console.error;

  constructor(private ip: string) {
    this.connection = new RTCPeerConnection();
    this.channel = this.connection.createDataChannel("data");
    this.connection.addTransceiver("video", { direction: "recvonly" });
    this.connection.addTransceiver("audio", { direction: "sendrecv" });

    this.connection.addEventListener("track", (event) => {
      switch (event.track.kind) {
        case "audio":
          break;
        case "video":
          break;
        default:
          console.log("unrecognized track event", event);
          break;
      }
    });

    this.channel.onmessage = this.onMessage;

    this.channel.onerror = this.errorHandler;
    this.channel.onclose = this.errorHandler;

    this.connection
      .createOffer()
      .then((offer) => this.connection.setLocalDescription(offer))
      .then(this.connect);
  }

  connect = async () => {
    const answer = {
      id: "STA_localnetwork",
      type: "offer",
      token: "",
      sdp: this.connection.localDescription!.sdp,
    };

    const response = await fetch(`http://${this.ip}:9991/con_notify`);
    const text = await response.text();
    const decoded = atob(text);
    const data1: string = JSON.parse(decoded).data1;
    const pem = data1.substring(10, data1.length - 10);
    const pathEnding = calcLocalPathEnding(data1);
    const aesKey = generateAesKey();
    //const key = await rsaLoadPublicKey(pem);

    const data1Out = aesEncrypt(JSON.stringify(answer), aesKey);
    const data2Out = rsaEncrypt(aesKey, pem);
    const body = JSON.stringify({
      data1: data1Out,
      data2: data2Out,
    });

    const response2 = await fetch(
      `http://${this.ip}:9991/con_ing_${pathEnding}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    const decrypted = aesDecrypt(await response2.text(), aesKey);
    await this.connection.setRemoteDescription(JSON.parse(decrypted));

    this.heartbeatTimer = setInterval(() => {
      const date = new Date();
      this.channel.send(
        JSON.stringify({
          type: "heartbeat",
          data: {
            timeInStr: formatDate(date),
            timeInNum: Math.floor(date.valueOf() / 1e3),
          },
        })
      );
    }, 2000);
  };

  onMessage = (event: MessageEvent) => {
    if (typeof event.data !== "string") {
      console.warn("Unrecognized event", event);
      return;
    }

    const data = JSON.parse(event.data);

    if (data.type === "validation") {
      if (data.data === "Validation Ok.") {
        return;
      }

      this.channel.send(
        JSON.stringify({
          topic: "",
          type: "validation",
          data: encryptKey(data.data),
        })
      );
      return;
    }

    console.log(data);
  };

  move = (x: number, y: number, z: number) => {
    const id =
      (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);

    this.channel.send(
      JSON.stringify({
        type: "msg",
        topic: "rt/api/sport/request",
        data: {
          header: { identity: { id, api_id: 1008 } },
          parameter: JSON.stringify({ x, y, z }),
        },
      })
    );
  };

  emote = (emoteId: number) => {
    const id =
      (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);

    this.channel.send(
      JSON.stringify({
        type: "msg",
        topic: "rt/api/sport/request",
        data: {
          header: { identity: { id, api_id: emoteId } },
          parameter: JSON.stringify(emoteId),
        },
      })
    );
  };

  dispose() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }
}

function calcLocalPathEnding(data1: string) {
  const strArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const last10 = data1.slice(-10);
  const chunks = [];

  for (let i = 0; i < last10.length; i += 2) {
    chunks.push(last10.slice(i, i + 2));
  }

  const arrayList = [];

  for (const chunk of chunks) {
    if (chunk.length > 1) {
      const secondChar = chunk[1];
      const index = strArr.indexOf(secondChar);
      if (index !== -1) {
        arrayList.push(index);
      } else {
        console.warn(`Character ${secondChar} not found in strArr.`);
      }
    }
  }

  return arrayList.join("");
}

function generateAesKey() {
  const uuid = crypto.randomUUID();
  const uuidHex = uuid.replace(/-/g, "").toLowerCase();
  return uuidHex;
}

function aesEncrypt(data: string, key: string) {
  // CryptoJS pads using PKCS7 (same as PKCS5 for AES)
  const keyWordArray = CryptoJS.enc.Utf8.parse(key);
  const dataWordArray = CryptoJS.enc.Utf8.parse(data);

  const encrypted = CryptoJS.AES.encrypt(dataWordArray, keyWordArray, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Base64-encoded ciphertext
}

function aesDecrypt(encryptedBase64: string, keyStr: string) {
  const key = CryptoJS.enc.Utf8.parse(keyStr);

  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

function rsaEncrypt(data: string, pemPublicKey: string) {
  const publicKey = forge.pki.publicKeyFromPem(wrapPem(pemPublicKey));

  const maxChunkSize = publicKey.n.bitLength() / 8 - 11;
  const dataBytes = new TextEncoder().encode(data);
  const encryptedChunks = [];

  for (let i = 0; i < dataBytes.length; i += maxChunkSize) {
    const chunk = dataBytes.slice(i, i + maxChunkSize);
    const chunkStr = String.fromCharCode(...chunk);
    const encrypted = publicKey.encrypt(chunkStr, "RSAES-PKCS1-V1_5");
    encryptedChunks.push(encrypted);
  }

  // Concatenate and Base64 encode the full encrypted blob
  const encryptedBytes = forge.util.createBuffer();
  encryptedChunks.forEach((chunk) => encryptedBytes.putBytes(chunk));

  const base64Encrypted = forge.util.encode64(encryptedBytes.getBytes());
  return base64Encrypted;
}

function wrapPem(base64Key: string) {
  return `-----BEGIN PUBLIC KEY-----\n${base64Key
    .match(/.{1,64}/g)!
    .join("\n")}\n-----END PUBLIC KEY-----`;
}

function formatDate(r: Date) {
  const n = r,
    y = n.getFullYear(),
    m = ("0" + (n.getMonth() + 1)).slice(-2),
    d = ("0" + n.getDate()).slice(-2),
    hh = ("0" + n.getHours()).slice(-2),
    mm = ("0" + n.getMinutes()).slice(-2),
    ss = ("0" + n.getSeconds()).slice(-2);
  return y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;
}

function encryptKey(key: string): string {
  return CryptoJS.MD5(`UnitreeGo2_${key}`).toString(CryptoJS.enc.Base64);
}
