"use client";
import React, { useEffect, useState } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import { GoSidebarExpand } from "react-icons/go";
import { IoLibrary } from "react-icons/io5";
import { BiMessageDetail } from "react-icons/bi"; // 新增聊天室圖標
import { AiOutlineDelete } from "react-icons/ai"; // 新增刪除圖標
import { useRouter, usePathname } from "next/navigation";
import { useChatHistoryStore } from "@/store/chatHistoryStore";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { chatHistory, fetchChatHistory } = useChatHistoryStore();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (!userName) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionId = localStorage.getItem("userName");
      if (!sessionId) {
        router.push("/"); // 導向登入頁面
        return;
      }
      fetchChatHistory(sessionId, "dschat");
    }
  }, [fetchChatHistory, router]);

  const deleteChatHistory = async (book_link: string) => {
    const sessionId = localStorage.getItem("userName");
    if (sessionId) {
      try {
        await fetch(
          `/api/dschat?sessionId=${sessionId}&book_link=${book_link}`,
          {
            method: "DELETE",
          }
        );
        const encodedUrl = encodeURIComponent(book_link);
        if (pathname.includes(encodedUrl)) {
          router.push("/chat");
        }
      } catch (error) {
        console.error("Error deleting chat history:", error);
      } finally {
        fetchChatHistory(sessionId, "dschat");
      }
    }
  };

  return (
    <div className="flex" style={{ height: "calc(100vh - 70px)" }}>
      <div
        className={`flex flex-col relative h-full bg-gray-900 border-gray-700 
      transition-all duration-300 ease-in-out z-50
      ${isSidebarOpen ? "w-64 border-r" : "w-20"}`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <IoLibrary className="w-6 h-6 text-gray-300" />
            {isSidebarOpen && (
              <span className="text-lg font-semibold text-gray-200">
                AI 讀書助手
              </span>
            )}
          </div>
          {isSidebarOpen ? (
            <GoSidebarCollapse
              className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            />
          ) : (
            <GoSidebarExpand
              className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            />
          )}
        </div>

        {/* New Chat Button */}
        <button
          className="flex items-center gap-2 m-4 p-3 rounded-lg 
        border border-gray-700 text-gray-300
        hover:bg-gray-800 hover:text-gray-200 transition-colors"
          onClick={() => {
            router.push("/chat");
          }}
        >
          <BiMessageDetail className="w-5 h-5" />
          {isSidebarOpen && <span>新對話</span>}
        </button>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto">
          {chatHistory.map((chat) => (
            <div
              key={chat._id}
              className="relative flex items-center justify-start gap-2 mx-2 "
            >
              {isSidebarOpen && (
                <button
                  className="opacity-20 group-hover:opacity-100 p-1 
                hover:bg-gray-700 rounded transition-opacity"
                  onClick={() => {
                    deleteChatHistory(chat.book_link);
                  }}
                >
                  <AiOutlineDelete className="w-4 h-4" />
                </button>
              )}
              <div
                className="flex flex-1 items-center justify-between p-3 rounded-lg
            text-gray-300 hover:bg-gray-800 cursor-pointer group"
                onClick={() => {
                  const encodedUrl = encodeURIComponent(chat.book_link);
                  router.push(`/dschat/${encodedUrl}`);
                }}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <BiMessageDetail className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="truncate text-sm">
                      {chat.book_link.split("products/")[1].split(".html")[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
