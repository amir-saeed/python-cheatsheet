# python-cheatsheet

python3 -m venv .venv
source .venv/bin/activate

pip freeze > requirements.txt

pip show pydantic

uvicorn main:app --reload --host 0.0.0.0 --port 8000

uvicorn main:app --reload


docker run -d \
  --name maritime-mongo \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:6

mongodb://admin:secret@localhost:27017

version: "3.9"

services:
  mongo:
    image: mongo:6
    container_name: maritime-mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret
      MONGO_INITDB_DATABASE: maritime
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

volumes:
  mongo_data:


  4. Verify MongoDB is Running

Inside container:

docker exec -it maritime-mongo mongosh -u admin -p secret


Then check DBs:

show dbs;
use maritime;
db.items.find();


npm install mongoose




1. Install Dependencies

Inside your Next.js app:

npm install mongoose

2. MongoDB Connection Helper

Create lib/mongodb.ts:

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

/**
 * Global is used here to maintain a cached connection across hot reloads in dev.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

3. Define a Schema & Model

Create models/Item.ts:

import mongoose, { Schema, models, model } from "mongoose";

const ItemSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    supplier: { type: String, required: true },
  },
  { timestamps: true }
);

const Item = models.Item || model("Item", ItemSchema);
export default Item;

4. Create Next.js API Routes
pages/api/items/index.ts (GET & POST)
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Item from "../../../models/Item";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    const items = await Item.find({});
    return res.status(200).json(items);
  }

  if (req.method === "POST") {
    const { name, price, supplier } = req.body;
    const newItem = await Item.create({ name, price, supplier });
    return res.status(201).json(newItem);
  }

  return res.status(405).end(); // Method not allowed
}

pages/api/items/[id].ts (GET by ID, DELETE, PUT)
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Item from "../../../models/Item";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (req.method === "GET") {
    const item = await Item.findById(id);
    return res.status(200).json(item);
  }

  if (req.method === "PUT") {
    const updatedItem = await Item.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(updatedItem);
  }

  if (req.method === "DELETE") {
    await Item.findByIdAndDelete(id);
    return res.status(204).end();
  }

  return res.status(405).end();
}

5. Example Frontend Page

pages/index.tsx:

import { useState, useEffect } from "react";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", price: "", supplier: "" });

  useEffect(() => {
    fetch("/api/items")
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  const addItem = async () => {
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", supplier: "" });
    const res = await fetch("/api/items");
    setItems(await res.json());
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Maritime Items</h1>

      <div className="mb-4">
        <input
          placeholder="Item Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border p-1 mr-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border p-1 mr-2"
        />
        <input
          placeholder="Supplier"
          value={form.supplier}
          onChange={e => setForm({ ...form, supplier: e.target.value })}
          className="border p-1 mr-2"
        />
        <button onClick={addItem} className="bg-blue-600 text-white px-3 py-1 rounded">
          Add Item
        </button>
      </div>

      <ul>
        {items.map((item) => (
          <li key={item._id}>
            {item.name} – ${item.price} (Supplier: {item.supplier})
          </li>
        ))}
      </ul>
    </div>
  );
}

6. Environment Variables

Create .env.local:

MONGO_URI=mongodb://localhost:27017/maritime