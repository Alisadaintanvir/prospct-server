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
  origin: "https://app.prospct.io", // Replace with your frontend domain
  methods: "GET,POST,PUT,DELETE", // Add allowed methods
  allowedHeaders: "Content-Type,Authorization", // Add allowed headers
};

app.use(cors(corsOptions));

app.use("/api", authRoutes);
app.use("/api", searchRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
