import { Client } from "@stomp/stompjs";

let client = null;
let isConnected = false;
const subscriptions = {};

export const connectWebSocket = () => {
  client = new Client({
    brokerURL: "ws://localhost:8080/ws", // native WebSocket
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("✅ WebSocket Connected");
      isConnected = true;
    },

    onDisconnect: () => {
      isConnected = false;
    },

    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame);
    }
  });

  client.activate();
};

export const subscribeToComments = (postId, callback) => {
  if (!client || !isConnected) return;

  // prevent duplicate subscription
  if (subscriptions[postId]) return;

  subscriptions[postId] = client.subscribe(
    `/topic/comments/${postId}`,
    (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    }
  );
};

export const subscribeToLikes = (postId, callback) => {
  if (!client || !client.connected) return;

  client.subscribe(`/topic/likes/${postId}`, (message) => {
    const data = JSON.parse(message.body);
    callback(data);
  });
};