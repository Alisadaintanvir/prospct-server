const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const db = client.db();
const usersCollection = db.collection("users");

const authController = {
  registration: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { username, email, password: hashedPassword };
      await usersCollection.insertOne(newUser);

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Find user by email
      const existingUser = await usersCollection.findOne({ email });

      if (!existingUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = jwt.sign(
        { userId: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Update user token
      await usersCollection.updateOne(
        { _id: existingUser._id },
        { $set: { token } }
      );

      // Send response
      res.status(200).json({
        message: "Login successful",
        accessToken: token,
        user: {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  verifyToken: async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await usersCollection.findOne(
        { _id: ObjectId.createFromHexString(decoded.userId) },
        { projection: { password: 0 } }
      );

      if (!user) return res.status(401).json({ message: "User not found" });

      if (user.token !== token) {
        return res.status(401).json({ message: "Token mismatch" });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });
      // Decode the token to get user id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await usersCollection.updateOne(
        { _id: ObjectId.createFromHexString(decoded.userId) },
        { $set: { token: null } }
      );
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = authController;
