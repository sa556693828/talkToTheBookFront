"use client";

import { useEffect, use, useCallback, useState, useRef } from "react";
import ChatComponent from "@/components/Chat";
import { UserHistory } from "@/models/ChatHistory";

// 定義頁面參數類型
interface PageProps {
  params: {
    url: string;
  };
}

export default function ChatContent({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const resolvedParams = use(params);
  const decodedUrl = decodeURIComponent(resolvedParams.url);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [chatLog, setChatLog] = useState<UserHistory[]>([]);
  const [currentChat, setCurrentChat] = useState<UserHistory[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // 自動調整高度的函數
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };
  const handleStream = useCallback(async (message: string) => {
    setLoading(true);
    try {
      setCurrentChat((prev) => [...prev, { role: "human", content: message }]);
      setPrompts([]);
      const env = process.env.NODE_ENV;
      const baseUrl =
        env === "development"
          ? "http://54.238.1.161:9000"
          : process.env.NEXT_PUBLIC_NGROK_URL;

      const response = await fetch(
        `${baseUrl}/chat?message=${message}&book_link=${decodedUrl}`
      );

      // 檢查響應狀態
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 檢查 response.body 是否為空
      if (!response.body) {
        throw new Error("Response body is null");
      }
      setIsStreaming(true);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      setLoading(false);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // 將新的chunk添加到buffer中
        buffer += decoder.decode(value, { stream: true });

        // 嘗試按行分割並解析
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 保存最後一個不完整的行

        // 處理每一行數據
        for (const line of lines) {
          if (line.trim()) {
            // 忽略空行
            try {
              const parsedData = JSON.parse(line);
              if (parsedData.content) {
                setCurrentChat((prev) => {
                  const lastMessage = prev[prev.length - 1];

                  // 如果最後一條消息是AI的回應，則更新其內容
                  if (lastMessage && lastMessage.role === "ai") {
                    const updatedChat = [...prev];
                    updatedChat[updatedChat.length - 1] = {
                      role: "ai",
                      content: lastMessage.content + parsedData.content,
                    };
                    return updatedChat;
                  }

                  return [
                    ...prev,
                    {
                      role: "ai",
                      content: parsedData.content,
                    },
                  ];
                });
              }
              if (parsedData.prompt) {
                const promptArray = parsedData.prompt
                  .split(/\d+\.\s*/) // 用數字加點分割
                  .filter((item: string) => item.trim()) // 過濾空字串
                  .map((item: string) => item.replace(/\s+/g, " ").trim()); // 處理多餘空白

                setPrompts((prev) => [...prev, ...promptArray]);
              }
            } catch (e) {
              console.warn("Failed to parse line:", line);
            }
          }
        }
      }

      // 處理最後剩餘的buffer
      if (buffer.trim()) {
        try {
          const parsedData = JSON.parse(buffer);
          if (parsedData.content) {
            setCurrentChat((prev) => {
              const lastMessage = prev[prev.length - 1];

              // 如果最後一條消息是AI的回應，則更新其內容
              if (lastMessage && lastMessage.role === "ai") {
                const updatedChat = [...prev];
                updatedChat[updatedChat.length - 1] = {
                  role: "ai",
                  content: lastMessage.content + parsedData.content,
                };
                return updatedChat;
              }

              return [
                ...prev,
                {
                  role: "ai",
                  content: parsedData.content,
                },
              ];
            });
          }
          if (parsedData.prompt) {
            const promptArray = parsedData.prompt
              .split(/\d+\.\s*/) // 用數字加點分割
              .filter((item: string) => item.trim()) // 過濾空字串
              .map((item: string) => item.replace(/\s+/g, " ").trim()); // 處理多餘空白

            setPrompts((prev) => [...prev, ...promptArray]);
          }
        } catch (e) {
          console.warn("Failed to parse final buffer:", buffer);
        }
      }
    } catch (error: any) {
      console.error("Stream error:", error);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        await handleStream(inputValue);
      } catch (error) {
        console.error("Submit error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      // 如果正在輸入中文，直接返回
      if (isComposing) {
        return;
      }

      if (e.shiftKey) {
        return;
      } else if (!isSubmitting) {
        e.preventDefault();
        const currentInput = inputValue.trim();
        setInputValue("");
        if (currentInput) {
          await handleSubmit(e);
        }
      }
    }
  };

  // 添加輸入法事件處理
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };
  useEffect(() => {
    const getChatHistory = async (sessionId: string) => {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        setChatLog(data.chatHistory.messages);
      }
    };
    const sessionId = localStorage.getItem("userName");
    console.log(sessionId);
    if (sessionId) {
      getChatHistory(sessionId);
    }
  }, [decodedUrl]);

  return (
    <div className="text-black flex-1">
      <div className="p-4 h-[calc(100vh-70px)] relative flex flex-col border-b border-black/20">
        {/* 聊天訊息區域 */}
        <div className="flex-1 overflow-y-auto mb-4">
          <ChatComponent
            loading={loading}
            chatLog={chatLog}
            currentChat={currentChat}
            prompts={prompts}
            handleQuery={handleStream}
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 absolute bottom-4 w-1/2 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-start w-full bg-[#202123] rounded-xl shadow-sm border border-gray-800/50">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustHeight();
              }}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
              placeholder="輸入訊息... (Enter 發送, Shift + Enter 換行)"
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none resize-none min-h-[48px] max-h-[200px] overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4B5563 transparent",
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={`px-4 py-3 transition-colors self-end
              ${
                inputValue.trim()
                  ? "text-white hover:text-gray-300 cursor-pointer"
                  : "text-gray-600 cursor-not-allowed"
              }`}
              title={!inputValue.trim() ? "請輸入訊息" : "發送訊息"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}