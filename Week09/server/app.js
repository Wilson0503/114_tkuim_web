import express from "express";
import dotenv from "dotenv";
import signupRouter from "./routes/signup.js";

dotenv.config();

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  const allowed = process.env.ALLOWED_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", allowed);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Routes
app.use("/api/signup", signupRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// 500
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Server Internal Error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
