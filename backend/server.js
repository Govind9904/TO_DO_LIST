const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});
// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running 🚀",
  });
});

app.get("/abc123", (req, res) => {
  res.send("HELLO GOVIND");
});
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});
// DB Connect
console.log("ENV:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected");

    // START SERVER ONLY AFTER DB CONNECT
    const PORT = process.env.PORT || 6000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ DB Error:", err.message);
  });