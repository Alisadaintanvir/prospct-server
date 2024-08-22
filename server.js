const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

const corsOptions = {
  origin: [
    "https://app.prospct.io", // Production frontend
    "http://localhost:5173", // Local development frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api", authRoutes);
app.use("/api", searchRoutes);

app.get("/", (req, res) => {
  res.send("Server is working fine.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
