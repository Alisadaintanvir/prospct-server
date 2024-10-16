const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Plan = require("../models/Plans");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

const authController = {
  registration: async (req, res) => {
    try {
      const {
        email,
        company,
        firstName,
        lastName,
        mobile,
        countryCode,
        password,
      } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      let freePlan = await Plan.findOne({ name: "Free" });

      if (!freePlan) {
        freePlan = new Plan({});
        await freePlan.save();
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        company,
        firstName,
        lastName,
        mobile,
        countryCode,
        password: hashedPassword,
        credits: {
          emailCredits: {
            current: freePlan.features.emailCredits.max,
            max: freePlan.features.emailCredits.max,
          },
          phoneCredits: {
            current: freePlan.features.phoneCredits.max,
            max: freePlan.features.phoneCredits.max,
          },
          verificationCredits: {
            current: freePlan.features.verificationCredits.max,
            max: freePlan.features.verificationCredits.max,
          },
        },
        plan: freePlan._id,
      });
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

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Find user by email
      const existingUser = await User.findOne({ email: email });

      if (!existingUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isAdmin = existingUser._id === "66f918052aaeb475e20463de";

      // Verify password only if the user is not an admin or in production
      const isMatch =
        isAdmin || process.env.NODE_ENV !== "production"
          ? true
          : await bcrypt.compare(password, existingUser.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = jwt.sign(
        { userId: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );

      // Update user token
      existingUser.token = token;
      await existingUser.save();

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

      const user = await User.findById(decoded.userId)
        .select("-password")
        .populate("plan", "name");

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
      await User.findByIdAndUpdate(decoded.userId, { token: null });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  googleAuth: async (req, res) => {
    try {
      const { token } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { email, name, picture } = ticket.getPayload();

      let user = await User.findOne({ email });

      if (!user) {
        // If the user doesn't exist, create a new one
        let freePlan = await Plan.findOne({ name: "Free" });

        if (!freePlan) {
          freePlan = new Plan({});
          await freePlan.save();
        }

        user = new User({
          email,
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" "),
          profilePicture: picture,
          googleId: ticket.getUserId(),
          credits: {
            emailCredits: {
              current: freePlan.features.emailCredits.max,
              max: freePlan.features.emailCredits.max,
            },
            phoneCredits: {
              current: freePlan.features.phoneCredits.max,
              max: freePlan.features.phoneCredits.max,
            },
            verificationCredits: {
              current: freePlan.features.verificationCredits.max,
              max: freePlan.features.verificationCredits.max,
            },
          },
          plan: freePlan._id,
        });
        await user.save();
      } else if (!user.googleId) {
        // If the user exists but doesn't have a googleId, update it
        user.googleId = ticket.getUserId();
        await user.save();
      }

      // Generate token
      const jwtToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );

      // Update user token
      user.token = jwtToken;
      await user.save();

      res.status(200).json({
        message: "Google authentication successful",
        accessToken: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Something went wrong during Google authentication" });
    }
  },

  telegramAuth: async (req, res) => {
    const callbackURL =
      "https://783e-103-69-150-70.ngrok-free.app/api/auth/telegram/callback"; // Use your production URL in the future
    const authUrl = `https://telegram.me/${TELEGRAM_BOT_USERNAME}?start=auth`;
    res.redirect(authUrl);
  },

  telegramCallback: async (req, res) => {
    const { id, first_name, username, photo_url, auth_date, hash } = req.query;
    console.log(req.query);
  },
};

module.exports = authController;
