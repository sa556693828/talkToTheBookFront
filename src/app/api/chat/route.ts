import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatHistory from "@/models/ChatHistory";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    // 測試查詢特定 SessionId
    const chatHistory = await ChatHistory.findOne({ SessionId: sessionId });

    return NextResponse.json({
      success: true,
      chatHistory,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "獲取聊天記錄失敗" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { sessionId, message } = body;

    let chatHistory = await ChatHistory.findOne({ SessionId: sessionId });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        SessionId: sessionId,
        messages: [],
      });
    }

    chatHistory.messages.push({
      role: "human",
      content: message,
    });

    await chatHistory.save();

    return NextResponse.json({ success: true, data: chatHistory });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "保存聊天記錄失敗" },
      { status: 500 }
    );
  }
}
