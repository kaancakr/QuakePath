import { NativeModules, NativeEventEmitter } from "react-native";
import { v4 as uuid } from "uuid";

const { NearbyMesh } = NativeModules;
const emitter = new NativeEventEmitter(NearbyMesh);

const MAX_HOPS = 8;
const TTL_MS = 5 * 60 * 1000;

type MeshMessage = {
  id: string;
  source: string;
  destination?: string;
  hop: number;
  ttl: number;
  payload: any;
};

class MeshRouter {
  nodeId = "";
  peers = new Set<string>();
  cache = new Set<string>();

  async start() {
    console.log("[MeshRouter] start() called");
    this.nodeId = await NearbyMesh.startMesh();
    console.log("[MeshRouter] nodeId =", this.nodeId);

    emitter.addListener("PeerConnected", id => {
      console.log("[MeshRouter] PeerConnected:", id);
      this.peers.add(id);
    });

    emitter.addListener("PeerDisconnected", id => {
      console.log("[MeshRouter] PeerDisconnected:", id);
      this.peers.delete(id);
    });

    emitter.addListener("MeshInbound", msg => {
      console.log("[MeshRouter] MeshInbound raw:", msg);
      this.onReceive(JSON.parse(msg));
    });
  }

  send(payload: any, destination?: string) {
    const msg: MeshMessage = {
      id: uuid(),
      source: this.nodeId,
      destination,
      hop: 0,
      ttl: Date.now() + TTL_MS,
      payload
    };
    console.log("[MeshRouter] send()", msg);
    this.forward(msg);
  }

  onReceive(msg: MeshMessage) {
    if (this.cache.has(msg.id)) return;
    if (Date.now() > msg.ttl) return;

    this.cache.add(msg.id);
    msg.hop++;

    if (!msg.destination || msg.destination === this.nodeId) {
      console.log("[MeshRouter] Delivering payload to self", msg.payload);
      this.deliver(msg.payload);
    } else {
      console.log(
        "[MeshRouter] Message not for me, dst=",
        msg.destination,
        "nodeId=",
        this.nodeId
      );
    }

    if (msg.hop < MAX_HOPS) {
      this.forward(msg);
    }
  }

  forward(msg: MeshMessage) {
    for (const peer of this.peers) {
      NearbyMesh.send(peer, JSON.stringify(msg));
    }
  }

  deliver(payload: any) {
    console.log("📩 MESH MESSAGE:", payload);
  }
}

export const meshRouter = new MeshRouter();
