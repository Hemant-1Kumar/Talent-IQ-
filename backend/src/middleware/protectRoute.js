import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // 🔥 CHECK FIRST (NO DUPLICATE CREATE)
      let user = await User.findOne({ clerkId });

      if (!user) {
        // extra safety check by email fallback
        const email = `${clerkId}@temp.com`;

        const existingEmailUser = await User.findOne({ email });

        if (existingEmailUser) {
          user = existingEmailUser;
        } else {
          user = await User.create({
            clerkId,
            name: "New User",
            email,
            profileImage: "",
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("protectRoute error:", error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
];