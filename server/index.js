import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/", express.static(path.join(__dirname, "..", "client")));

// In‑memory cache
let cached = { ts: 0, data: {} };
const REFRESH_MS = 30_000; // 30 s

async function grabScore() {
  try {
    const url =
      "https://cricclubs.com/FT20/viewScorecard.do?matchId=675&clubId=862";
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    // Extract data
    const teams = $(".matchHeader .teamName").map((_, el) => $(el).text().trim()).get();
    const scores = $(".matchHeader .scoreText").map((_, el) => $(el).text().trim()).get();
    const runRate = $(".reqRR").text().trim();

    return { updated: new Date().toISOString(), teams, scores, runRate };
  } catch (err) {
    console.warn("Score grab failed:", err);
    return { error: "Could not fetch score." };
  }
}

app.get("/api/score", async (_, res) => {
  if (Date.now() - cached.ts > REFRESH_MS || !cached.data.updated) {
    cached.data = await grabScore();
    cached.ts = Date.now();
  }
  res.json(cached.data);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
