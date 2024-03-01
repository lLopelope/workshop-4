import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";
import crypto from 'crypto';


let lastReceivedMessage: string | null = null;
let lastSentMessage: string | null = null;

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // TODO implement the status route
   _user.get("/status", (req, res) => { res.send('live');});

   _user.get('/getLastReceivedMessage', (req, res) => {
    res.json({ result : lastReceivedMessage });
});

// Route to get the last sent message
  _user.get('/getLastSentMessage', (req, res) => {
    res.json({ result: lastSentMessage });
});

_user.post("/message", (req, res) => {
  const { message }: { message: string } = req.body;

  // Update the last received message
  lastReceivedMessage = message;
  
 res.send('success');
  //res.json({ message: "Message received successfully" });
});

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
