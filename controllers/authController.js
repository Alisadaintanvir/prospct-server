const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authController = {
  registration: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      existingUser.token = token;
      await existingUser.save();

      res.status(200).json({
        message: "Login successful",
        accessToken: token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong", err });
    }
  },
};

module.exports = authController;
