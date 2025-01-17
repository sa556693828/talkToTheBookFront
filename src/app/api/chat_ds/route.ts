import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ChatHistory from "@/models/ChatHistory";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const book_link = searchParams.get("book_link") || undefined;
    // 測試查詢特定 SessionId
    let chatHistory;
    if (book_link) {
      chatHistory = await ChatHistory.findOne({
        SessionId: sessionId,
        book_link: book_link ? book_link : undefined,
      });
    } else {
      chatHistory = await ChatHistory.find({ SessionId: sessionId });
    }

    return NextResponse.json({
      success: true,
      chatHistory,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "獲取聊天記錄失敗" + error,
    });
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
      { success: false, error: "保存聊天記錄失敗" + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const book_link = searchParams.get("book_link");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "缺少必要參數sessionId" },
        { status: 400 }
      );
    }

    const query = {
      SessionId: sessionId,
      ...(book_link && { book_link }),
    };

    const result = await ChatHistory.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "未找到符合條件的聊天記錄" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "聊天記錄已成功刪除",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "刪除聊天記錄失敗" + error },
      { status: 500 }
    );
  }
}
