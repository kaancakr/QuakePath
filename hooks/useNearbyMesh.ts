// hooks/useNearbyMesh.ts
import { useEffect, useState } from "react";
import { meshRouter } from "@/hooks/MeshRouter";

export function useNearbyMesh() {
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    console.log("[useNearbyMesh] mount");

    meshRouter.start().then(() => {
      console.log("[useNearbyMesh] meshRouter started, nodeId =", meshRouter.nodeId);
      setDeviceId(meshRouter.nodeId);
    });

    const interval = setInterval(() => {
      const peersArray = Array.from(meshRouter.peers);
      setConnectedDevices(peersArray);
      console.log("[useNearbyMesh] peers:", peersArray);
    }, 1000);

    meshRouter.deliver = (payload) => {
      console.log("[useNearbyMesh] deliver payload:", payload);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: payload.sender ?? "unknown",
          content: payload.content,
          timestamp: new Date().toISOString(),
          type: payload.type ?? "chat",
        },
      ]);
    };

    return () => {
      console.log("[useNearbyMesh] unmount, clearing interval");
      clearInterval(interval);
    };
  }, []);

  const sendMessage = (content: string) => {
    console.log("[useNearbyMesh] sendMessage", { content, deviceId });
    meshRouter.send({
      type: "chat",
      content,
      sender: deviceId,
    });
  };

  return {
    isConnected: connectedDevices.length > 0,
    connectedDevices,
    messageHistory: messages,
    sendMessage,
    deviceId,
  };
}
