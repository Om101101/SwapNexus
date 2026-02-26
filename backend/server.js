require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.send("SkillSyncAI Backend Running 🚀");
});

// ✅ NEW MESSAGE ROUTE (Add This)
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from SwapNexus Backend 🚀" });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then((conn) => {
  console.log(`
=================================
🟢  DATABASE STATUS: CONNECTED
📦  Host: ${conn.connection.host}
=================================
`);
})
.catch((err) => {
  console.log(`
=================================
🔴  DATABASE STATUS: FAILED
=================================
`);
  console.error(err);
  process.exit(1); 
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});