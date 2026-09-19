import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db.js";
import "./indexer.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/circle/:id", (req, res) => {
  const circle = db.prepare("SELECT * FROM circles WHERE id = ?").get(req.params.id);
  if (!circle) return res.status(404).json({ error: "circle not found" });
  const feed = db
    .prepare("SELECT * FROM events WHERE circle_id = ? ORDER BY timestamp DESC LIMIT 50")
    .all(req.params.id);
  res.json({ circle, feed });
});

app.get("/member/:address/history", (req, res) => {
  const address = req.params.address.toLowerCase();
  const history = db
    .prepare("SELECT * FROM events WHERE lower(address) = ? ORDER BY timestamp DESC")
    .all(address);
  res.json({ address, history });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[api] Listening on http://localhost:${PORT}`));
