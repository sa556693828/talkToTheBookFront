import mongoose from "mongoose";

export interface UserHistory {
  role: string;
  content: string;
}

// 定義消息的 Schema
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["human", "ai"], // 限制 role 只能是這兩個值
  },
  content: {
    type: String,
    required: true,
  },
});

// 定義聊天歷史的 Schema
const chatHistorySchema = new mongoose.Schema(
  {
    SessionId: {
      type: String,
      required: true,
      index: true, // 添加索引以提高查詢效率
    },
    messages: [messageSchema],
    book_link: {
      type: String,
      required: true,
    },
  },
  { collection: "chat_histories" }
);

// 防止重複定義 model
const ChatHistory =
  mongoose.models.chat_histories ||
  mongoose.model("chat_histories", chatHistorySchema);

export default ChatHistory;
