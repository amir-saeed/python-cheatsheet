import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(process.env.MONGO_URI as string);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db("maritime");
  const collection = db.collection("items");

  if (req.method === "GET") {
    const items = await collection.find({}).toArray();
    return res.status(200).json(items);
  }

  if (req.method === "POST") {
    const { name, price } = req.body;
    const result = await collection.insertOne({ name, price });
    return res.status(201).json(result);
  }

  res.status(405).end(); // Method not allowed
}
