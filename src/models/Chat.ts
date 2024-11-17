import mongoose from "mongoose";

// 定義聊天記錄的 Schema
const chatSchema = new mongoose.Schema({
  url: { type: String, required: true },
  messages: [
    {
      role: { type: String, required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// 防止重複定義 model
const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
