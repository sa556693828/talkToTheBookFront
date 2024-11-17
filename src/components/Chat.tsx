"use client";

import { UserHistory } from "@/models/ChatHistory";
import { useEffect, useRef } from "react";
import { IoLibrary } from "react-icons/io5";
import ReactMarkdown from "react-markdown";

export default function ChatComponent({
  chatLog,
  currentChat,
  prompts,
  handleQuery,
  loading,
  basicPrompt,
}: {
  chatLog: UserHistory[];
  currentChat?: UserHistory[];
  prompts?: string[];
  handleQuery: (input: string) => void;
  loading: boolean;
  basicPrompt: string[];
}) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatLog, currentChat, prompts]);
  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col justify-start h-full pt-4 pb-20 px-2 gap-10 overflow-y-auto overflow-x-hidden scrollbar-hide"
    >
      {chatLog.length === 0 ||
        (currentChat === undefined && (
          <div className="flex px-4 gap-2 flex-col items-start justify-around ">
            <p className="text-sm text-gray-500">你可以從這些問題開始</p>
            {basicPrompt.map((prompt, index) => (
              <div
                key={index}
                className="rounded-lg w-full h-fit border border-amber-700 p-2 hover:bg-amber-700 hover:text-white transition-colors duration-300 cursor-pointer"
                onClick={() => handleQuery(prompt)}
              >
                {prompt}
              </div>
            ))}
          </div>
        ))}
      {chatLog.map((message: UserHistory, index: number) => (
        <div
          key={index}
          className={`flex ${
            message.role === "human" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "ai" && (
            <div className="flex rounded-full border border-amber-700 size-fit p-2 gap-2 mr-4">
              <IoLibrary className="w-3 h-3 text-amber-700" />
            </div>
          )}
          <div
            className={`${
              message.role === "human"
                ? "bg-gray-800 text-[#FFECD3] p-4"
                : "text-[#1E1E1E]"
            } rounded-[20px] max-w-2xl`}
          >
            {message.content}
          </div>
        </div>
      ))}
      {currentChat &&
        currentChat.map((message: UserHistory, index: number) => (
          <div
            key={index}
            className={`flex ${
              message.role === "human" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "ai" && (
              <div className="flex rounded-full border border-amber-700 size-fit p-2 gap-2 mr-4">
                <IoLibrary className="w-3 h-3 text-amber-700" />
              </div>
            )}
            <ReactMarkdown
              className={`${
                message.role === "human"
                  ? "bg-gray-800 text-[#FFECD3] p-4"
                  : "text-[#1E1E1E]"
              } rounded-[20px] max-w-2xl`}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ))}
      {loading && (
        <div className="flex justify-start w-full">
          <iframe src="https://lottie.host/embed/1761150a-2d15-43c9-aa56-0bb9c9add5d7/mcQjQQ2npP.json"></iframe>
        </div>
      )}
      {prompts && prompts.length > 0 && (
        <div className="flex px-4 gap-2 flex-col items-start justify-around ">
          <p className="text-sm text-gray-500">你可以這麼問</p>
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="rounded-lg w-full h-fit border border-amber-700 p-2 hover:bg-amber-700 hover:text-white transition-colors duration-300 cursor-pointer"
              onClick={() => handleQuery(prompt)}
            >
              {prompt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
