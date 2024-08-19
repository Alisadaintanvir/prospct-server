const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api", searchRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
