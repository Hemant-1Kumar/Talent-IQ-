import { StreamChat } from "stream-chat";
import { StreamVideoClient } from "@stream-io/node-sdk";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

// ✅ CHAT CLIENT
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

// ✅ VIDEO CLIENT (FIXED)
export const streamClient = new StreamVideoClient({
  apiKey,
  apiSecret,
});