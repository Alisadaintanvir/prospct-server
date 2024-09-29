const express = require("express");
const cors = require("cors");
const multer = require("multer");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");
const savedRoutes = require("./routes/savedRoutes");
const creditRoutes = require("./routes/creditRoutes");
const listRoutes = require("./routes/listRoutes");
const savedSearchRoutes = require("./routes/savedSearchRoutes");
const emailVerificationRoute = require("./routes/emailVerificationRoute");
const path = require("path");
const upload = require("./config/multerConfig");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

// Configure CORS properly
const corsOptions = {
  origin: ["https://app.prospct.io", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options("*", cors(corsOptions));

app.use("/api", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/list", listRoutes);
app.use("/api/saved-search", savedSearchRoutes);
app.use("/api/email-verify", emailVerificationRoute);

app.get("/", (req, res) => {
  res.send("Server is working fine.");
});

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
