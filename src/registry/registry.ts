import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string; privateKey?: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: (Node & { privateKey?: string })[];
};

const registeredNodes: Node[] = [];

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  _registry.post('/registerNode', (req, res) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    // Check if the node is already registered
    const existingNode = registeredNodes.find((node) => node.nodeId === nodeId);

    if (existingNode) {
      return res.status(400).json({ message: `Node ${nodeId} is already registered.` });
    }


    // Add the node to the registered nodes array
    registeredNodes.push({ nodeId, pubKey});
    const nodeRegistry: GetNodeRegistryBody = { nodes: registeredNodes };
    res.json(nodeRegistry);

    return res.status(201).json({ message: `Node ${nodeId} successfully registered.` });
  });

  _registry.get('/getNodeRegistry', (req, res) => {
    const nodeRegistry: GetNodeRegistryBody = { nodes: registeredNodes };
    res.json(nodeRegistry);
  });

  

  // TODO implement the status route
   _registry.get("/status", (req, res) => { res.send('live');});

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
} 
