// pages/index.tsx
import { useState, useEffect } from "react";

export default function Home() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [form, setForm] = useState({ quantity: 100, price: 500, delivery_days: 7 });
  const [prediction, setPrediction] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/analytics")
      .then(res => res.json())
      .then(data => setAnalytics(data));
  }, []);

  const handlePredict = async () => {
    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setPrediction(data.delayed ? "Likely Delayed" : "Likely On Time");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Maritime Supplier Dashboard</h1>

      {analytics && (
        <div className="my-4">
          <p>Total Orders: {analytics.total_orders}</p>
          <p>Avg Delivery Days: {analytics.avg_delivery_days.toFixed(1)}</p>
          <p>Delayed %: {analytics.delayed_percentage.toFixed(1)}%</p>
        </div>
      )}

      <div className="my-4">
        <h2 className="font-semibold">Predict Delay</h2>
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Delivery Days"
          value={form.delivery_days}
          onChange={e => setForm({ ...form, delivery_days: +e.target.value })}
        />
        <button onClick={handlePredict} className="ml-2 px-4 py-1 bg-blue-600 text-white rounded">
          Predict
        </button>
        {prediction && <p className="mt-2">{prediction}</p>}
      </div>
    </div>
  );
}
