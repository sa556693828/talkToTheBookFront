"use client";
import { useState } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import { GoSidebarExpand } from "react-icons/go";
import { IoLibrary } from "react-icons/io5";
import { RiBookmarkLine } from "react-icons/ri";
import { RiHistoryLine } from "react-icons/ri";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="flex" style={{ height: "calc(100vh - 70px)" }}>
      <div
        className={`flex flex-col relative items-center h-full bg-amber-50  border-amber-200 
      transition-all duration-300 ease-in-out z-50
      ${isSidebarOpen ? "w-64 border-r" : "w-20"}`}
      >
        {isSidebarOpen && (
          <GoSidebarExpand
            className="absolute top-2 right-2 w-6 h-6 text-amber-700 cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
        {!isSidebarOpen && (
          <GoSidebarCollapse
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-amber-700 cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
        {isSidebarOpen && (
          <div className="flex flex-col h-full pt-10 items-center overflow-hidden">
            {/* Logo 區域 */}
            <div className="flex items-center gap-2 mb-8 p-2">
              <IoLibrary className="w-8 h-8 text-amber-700" />
              <span className="text-xl font-bold text-amber-900 transition-opacity duration-300">
                AI 讀書助手
              </span>
            </div>

            {/* 導航選項 */}
            <nav className="flex-1">
              <ul className="space-y-2">
                <li>
                  <button className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-amber-100 text-amber-900">
                    <RiHistoryLine className="w-5 h-5" />
                    <span
                      className={`transition-opacity duration-300
                  ${
                    isSidebarOpen ? "opacity-100" : "opacity-0 hidden md:hidden"
                  }`}
                    >
                      歷史記錄
                    </span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-amber-100 text-amber-900">
                    <RiBookmarkLine className="w-5 h-5" />
                    <span
                      className={`transition-opacity duration-300
                  ${
                    isSidebarOpen ? "opacity-100" : "opacity-0 hidden md:hidden"
                  }`}
                    >
                      我的收藏
                    </span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
