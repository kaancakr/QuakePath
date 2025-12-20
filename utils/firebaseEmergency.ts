import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  CollectionReference,
} from "firebase/firestore";
import { db } from "@/FirebaseConfig";

export type EmergencyStatus = "active" | "resolved";

export interface EmergencyRecord {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  message: string;
  status: EmergencyStatus;
  createdAt: Date;
}

export interface EmergencyMessage {
  id: string;
  emergencyId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

const emergenciesRef = collection(db, "emergencies") as CollectionReference;

const toDate = (value?: Timestamp | null) =>
  value?.toDate ? value.toDate() : new Date();

export const createEmergencyAlert = async (input: {
  userId: string;
  lat: number;
  lng: number;
  message: string;
  status?: EmergencyStatus;
  initialMessageText?: string;
}) => {
  const payload = {
    userId: input.userId,
    lat: input.lat,
    lng: input.lng,
    message: input.message,
    status: input.status ?? "active",
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(emergenciesRef, payload);

  // Seed first message from creator so UI shows initial content
  const messagesRef = collection(emergenciesRef, ref.id, "messages");
  await addDoc(messagesRef, {
    senderId: input.userId,
    text: input.initialMessageText ?? input.message,
    createdAt: serverTimestamp(),
  });

  return {
    id: ref.id,
    ...payload,
    createdAt: new Date(),
  } as EmergencyRecord;
};

export const subscribeEmergencies = (
  onChange: (items: EmergencyRecord[]) => void
) => {
  const q = query(emergenciesRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items: EmergencyRecord[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        userId: data.userId ?? "unknown",
        lat: data.lat ?? 0,
        lng: data.lng ?? 0,
        message: data.message ?? "",
        status: (data.status as EmergencyStatus) ?? "active",
        createdAt: toDate(data.createdAt),
      };
    });
    onChange(items);
  });
};

export const sendEmergencyMessage = async (input: {
  emergencyId: string;
  senderId: string;
  text: string;
}) => {
  const messagesRef = collection(
    emergenciesRef,
    input.emergencyId,
    "messages"
  );

  await addDoc(messagesRef, {
    senderId: input.senderId,
    text: input.text,
    createdAt: serverTimestamp(),
  });
};

export const subscribeEmergencyMessages = (
  emergencyId: string,
  onChange: (messages: EmergencyMessage[]) => void
) => {
  const messagesRef = collection(emergenciesRef, emergencyId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const items: EmergencyMessage[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        emergencyId,
        senderId: data.senderId ?? "unknown",
        text: data.text ?? "",
        createdAt: toDate(data.createdAt),
      };
    });
    onChange(items);
  });
};
