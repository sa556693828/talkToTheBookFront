"use client";

import { useEffect, use, useCallback, useState, useRef } from "react";
import ChatComponent from "@/components/Chat";
import { UserHistory } from "@/models/ChatHistory";
import { useChatHistoryStore } from "@/store/chatHistoryStore";

// 定義頁面參數類型

export default function ChatContent({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const resolvedParams = use(params);
  const decodedUrl = decodeURIComponent(resolvedParams.url);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [chatLog, setChatLog] = useState<UserHistory[]>([]);
  const [currentChat, setCurrentChat] = useState<UserHistory[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [getChatHistory, setGetChatHistory] = useState(false);
  const { fetchChatHistory } = useChatHistoryStore();

  const basicPrompt = [
    "幫我總結這本書的內容",
    "告訴我為什麼要讀這本書",
    "書中都用了哪些例子證明",
    "幫我用一段話總結書中想傳達的核心觀點",
    "我是一個上班族，我該用什麼角度去理解書中的內容",
  ];

  // 自動調整高度的函數
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };
  const handleStream = useCallback(
    async (message: string) => {
      setLoading(true);
      const userName = localStorage.getItem("userName");
      if (!userName) {
        console.error("User name is not set");
        return;
      }
      try {
        setCurrentChat((prev) => [
          ...prev,
          { role: "human", content: message },
        ]);
        setPrompts([]);

        console.log("Sending request to:", "https://api.fluxmind.xyz/dschat");
        console.log("Request payload:", {
          message,
          book_link: decodedUrl,
          user_id: userName,
        });

        const response = await fetch("https://api.fluxmind.xyz/dschat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            message: message,
            book_link: decodedUrl,
            user_id: userName,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

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

          const decodedValue = decoder.decode(value);
          console.log("Received chunk:", decodedValue);

          try {
            const jsonData = JSON.parse(decodedValue);
            console.log("Parsed JSON:", jsonData);
          } catch (e) {
            console.warn("Failed to parse as JSON:", decodedValue);
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsedData = JSON.parse(line);
                if (parsedData.content) {
                  setCurrentChat((prev) => {
                    const lastMessage = prev[prev.length - 1];

                    if (lastMessage && lastMessage.role === "assistant") {
                      const updatedChat = [...prev];
                      updatedChat[updatedChat.length - 1] = {
                        role: "assistant",
                        content: lastMessage.content + parsedData.content,
                      };
                      return updatedChat;
                    }

                    return [
                      ...prev,
                      {
                        role: "assistant",
                        content: parsedData.content,
                      },
                    ];
                  });
                }
                if (parsedData.prompt) {
                  const promptArray = parsedData.prompt
                    .split(/\d+\.\s*/)
                    .filter((item: string) => item.trim())
                    .map((item: string) => item.replace(/\s+/g, " ").trim());

                  setPrompts((prev) => [...prev, ...promptArray]);
                }
              } catch (e) {
                console.warn("Failed to parse line:", e);
              }
            }
          }
        }

        if (buffer.trim()) {
          try {
            const parsedData = JSON.parse(buffer);
            if (parsedData.content) {
              setCurrentChat((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  const updatedChat = [...prev];
                  updatedChat[updatedChat.length - 1] = {
                    role: "assistant",
                    content: lastMessage.content + parsedData.content,
                  };
                  return updatedChat;
                }
                return [
                  ...prev,
                  {
                    role: "assistant",
                    content: parsedData.content,
                  },
                ];
              });
            }
            if (parsedData.prompt) {
              const promptArray = parsedData.prompt
                .split(/\d+\.\s*/)
                .filter((item: string) => item.trim())
                .map((item: string) => item.replace(/\s+/g, " ").trim());

              setPrompts((prev) => [...prev, ...promptArray]);
            }
          } catch (e) {
            console.warn("Failed to parse final buffer:", e);
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        throw error;
      } finally {
        fetchChatHistory(userName);
        setIsStreaming(false);
      }
    },
    [decodedUrl, fetchChatHistory]
  );

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

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };
  useEffect(() => {
    const getChatHistory = async (sessionId: string) => {
      try {
        setGetChatHistory(false);
        const response = await fetch(
          `/api/chat?sessionId=${sessionId}&book_link=${decodedUrl}`
        );
        const data = await response.json();
        if (data.success) {
          if (data.chatHistory) {
            setChatLog(data.chatHistory.messages);
          } else {
            setChatLog([]);
          }
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setGetChatHistory(true);
      }
    };
    const sessionId = localStorage.getItem("userName");
    if (sessionId) {
      getChatHistory(sessionId);
    }
  }, [decodedUrl]);

  return (
    <div className="text-black flex-1">
      <div className="p-4 h-[calc(100vh-70px)] relative flex flex-col border-b border-black/20">
        {getChatHistory ? (
          <div className="flex-1 overflow-y-auto mb-4">
            <ChatComponent
              loading={loading}
              chatLog={chatLog}
              currentChat={currentChat}
              prompts={prompts}
              handleQuery={handleStream}
              basicPrompt={basicPrompt}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4">
            <p>載入歷史訊息中...</p>
          </div>
        )}
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
