import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { client } from "./client";

dotenv.config();
const port = process.env.PORT || 6767;
const app = express();
const httpServer = app.listen(port);
const wss = new WebSocketServer({ server: httpServer });
const subscriber = client.duplicate();
let latestResult: any = null;
let wsClients: Map<string, WebSocket> = new Map();

async function connect() {
  await client.connect();
}
connect();

let OneuserId: any;

app.get("/", (req, res) => {
  res.send("Hello From CodeEditor-Server !");
});

wss.on("connection", function connection(ws) {
  console.log("A new WebSocket client connected!");

  ws.on("message", function message(data: any) {
    try {
      const parsedData = JSON.parse(data);
      const { code, language, userId } = parsedData;

      wsClients.set(userId, ws);
      OneuserId = userId;

      client.lPush("submission", JSON.stringify({ code, language, userId }));

      ws.send(
        JSON.stringify({
          success: true,
          message: "Code received and added to the queue",
        })
      );
    } catch (error) {
      console.log("Error processing message:", error);
      ws.send(
        JSON.stringify({
          success: false,
          message: "Failed to process the code.",
        })
      );
    }
  });

  ws.on("close", () => {
    wsClients.forEach((client, userId) => {
      if (client === ws) {
        wsClients.delete(userId);
      }
    });
    console.log("WebSocket disconnected!");
  });

  ws.on("error", (err) => console.log(err));
});

async function sendMessageToSender(userId: string, message: string) {
  const senderWs = wsClients.get(userId);
  if (senderWs && senderWs.readyState === WebSocket.OPEN) {
    senderWs.send(message);
  } else {
    console.log(`Sender with userId ${userId} is not connected`);
  }
}

async function setup() {
  try {
    await subscriber.connect();
    subscriber.subscribe("channel1", (message) => {
      console.log("Message Received on channel1: ", message);
      latestResult = message;

      sendMessageToSender(
        OneuserId,
        latestResult.replace(/\\u([0-9a-fA-F]{4})|\\n/g, "")
      );
    });
  } catch (error) {
    console.log(error);
  }
}

setup();
