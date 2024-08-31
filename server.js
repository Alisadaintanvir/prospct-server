const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");
const savedRoutes = require("./routes/savedRoutes");
const creditRoutes = require("./routes/creditRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

// Configure CORS properly
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ["https://app.prospct.io", "http://localhost:5173"];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api", authRoutes);
app.use("/api", searchRoutes);
app.use("/api", savedRoutes);
app.use("/api", creditRoutes);

app.get("/", (req, res) => {
  res.send("Server is working fine.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
