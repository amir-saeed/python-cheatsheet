# backend/main.py
from fastapi import FastAPI
import pandas as pd
import pickle

app = FastAPI()

# Load dataset & model
df = pd.read_csv("supplier_orders.csv")
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

@app.get("/analytics")
def get_analytics():
    total_orders = len(df)
    avg_delivery = df["delivery_days"].mean()
    delayed_pct = (df["delayed"].mean()) * 100
    return {
        "total_orders": total_orders,
        "avg_delivery_days": avg_delivery,
        "delayed_percentage": delayed_pct
    }

@app.post("/predict")
def predict(order: dict):
    features = [[
        order["quantity"],
        order["price"],
        order["delivery_days"]
    ]]
    prediction = model.predict(features)[0]
    return {"delayed": bool(prediction)}
