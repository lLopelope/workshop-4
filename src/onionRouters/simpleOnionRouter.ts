import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT,REGISTRY_PORT  } from "../config";
import { generateRsaKeyPair, exportPrvKey, exportPubKey } from "../crypto"; 
import { Node, RegisterNodeBody } from  "../registry/registry";

let lastReceivedEncryptedMessage: string | null = null;
let lastReceivedDecryptedMessage: string | null = null;
let lastMessageDestination: number | null = null;

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  const { privateKey, publicKey } = await generateRsaKeyPair();
  
  const publicKeyStr = await exportPubKey(publicKey);

  onionRouter.get("/getPrivateKey", async (req, res) => {
    try {
      const privateKeyStr = await exportPrvKey(privateKey);
      res.json({ result: privateKeyStr });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve private key" });
    }
  });

  const registerNode: RegisterNodeBody = {
    nodeId: nodeId,
    pubKey: publicKeyStr
  };

  const registryUrl = `http://localhost:${REGISTRY_PORT}/registerNode`;
  try {
    await fetch(registryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerNode),
    });
    console.log(`Node ${nodeId} successfully registered.`);
  } catch (error) {
    console.error(`Failed to register Node ${nodeId}: `);
  }




  // TODO implement the status route
   onionRouter.get("/status", (req, res) => { res.send('live');});

   onionRouter.get('/getLastReceivedEncryptedMessage', (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
});

// Route to get the last received decrypted message
    onionRouter.get('/getLastReceivedDecryptedMessage', (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
});

// Route to get the last message destination
    onionRouter.get('/getLastMessageDestination', (req, res) => {
    res.json({ result: lastMessageDestination });
});

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
