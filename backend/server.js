import express from "express";
import knex from "knex";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static("backend")); // Serve static files from the images folder

// This connects to the database stored in the file mentioned below
const knexInstance = knex({
  client: "sqlite3",
  connection: {
    filename: "./backend/memory_game.sqlite3",
  },
  useNullAsDefault: true,  // Omit warning in console
});

await knexInstance.raw(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// await knexInstance('scores').del();

const existing = await knexInstance("scores").first();

if (!existing) {
  await knexInstance("scores").insert([
    { username: "Alice", score: 45, difficulty: "easy" },
    { username: "Bob", score: 70, difficulty: "medium" },
    { username: "Charlie", score: 105, difficulty: "hard" }
  ]);
}

// 🎉 Well-structured REST API with proper HTTP methods and status codes
app.get("/cards", async (req, res) => {
  try {
    const { difficulty } = req.query;

    const limits = {
      easy: 6,
      medium: 8,
      hard: 10,
    };

    const limit = limits[difficulty];

    if (!limit) {
      return res.status(400).json({
        error: "Difficulty must be easy, medium, or hard",
      });
    }

    const cards = await knexInstance("card")
      .select("id", "name", "image")
      .orderByRaw("RANDOM()")
      .limit(limit);

    res.json(cards);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/score", async (req, res) => {
  try {
    const { username, score, difficulty } = req.body;

    const allowedDifficulties = ["easy", "medium", "hard"];

    if (!username || score === undefined || !allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        error: "username, score and difficulty required",
      });
    }

    const existing = await knexInstance("scores")
      .where({ username, difficulty })
      .first();

    // 🔴 [blocking] - This always overwrites the previous score. It should only update if the
    // new score is HIGHER, otherwise a player's best score gets lost.
    // Fix: if (existing && score > existing.score) { ... update ... }
    //      else if (existing) { return res.status(200).json({ message: "Score not updated (not higher)" }); }
    if (existing) {
      await knexInstance("scores")
        .where({ username, difficulty })
        .update({ score });

      return res.status(200).json({ message: "Score updated successfully" });
    }

    await knexInstance("scores").insert({ username, score, difficulty });

    res.status(201).json({ message: "Score saved successfully" });

  } catch (error) {
    // 🟡 [important] - Avoid exposing raw error.message to the client in production.
    // It can leak internal details (file paths, SQL errors, etc.).
    // Use a generic message like "Internal server error" and log the real error server-side.
    res.status(500).json({ error: error.message });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const { difficulty } = req.query;

    const query = knexInstance("scores")
      .select("username", "score", "difficulty")
      .orderBy("score", "desc");

    if (difficulty) {
      query.where("difficulty", difficulty);
    }

    const results = await query.limit(10);

    res.json(results);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});