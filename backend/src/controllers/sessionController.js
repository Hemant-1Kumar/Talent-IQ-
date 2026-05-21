import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;

    // ✅ safe auth check
    if (!req.user?._id || !req.user?.clerkId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    const callId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // ✅ create DB session first (always required)
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
    });

    // =========================
    // ✅ STREAM VIDEO (SAFE)
    // =========================
    try {
      const call = streamClient.call("default", callId);

      await call.getOrCreate({
        data: {
          created_by_id: clerkId,
          custom: {
            problem,
            difficulty,
            sessionId: session._id.toString(),
          },
        },
      });
    } catch (err) {
      console.error("Stream Video Error:", err.message);
    }

    // =========================
    // ✅ STREAM CHAT (SAFE)
    // =========================
    try {
      const channel = chatClient.channel("messaging", callId, {
        name: `${problem} Session`,
        created_by_id: clerkId,
        members: [clerkId],
      });

      await channel.create();
    } catch (err) {
      console.error("Stream Chat Error:", err.message);
    }

    return res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}