"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BiBookOpen } from "react-icons/bi";
import { IoLibrary } from "react-icons/io5";

export default function ChatPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 簡單的URL驗證
    if (!url) return;
    try {
      const encodedUrl = encodeURIComponent(url);
      router.push(`/chat/${encodedUrl}`);
    } catch (error) {
      console.error("Error submitting URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-8 flex-1 backdrop-blur">
      <div className="flex items-center justify-center mb-8">
        {isLoading ? (
          <BiBookOpen className="w-16 h-16 text-amber-700 animate-bounce" />
        ) : (
          <IoLibrary className="w-16 h-16 text-amber-700" />
        )}
      </div>
      <div className="space-y-6">
        <label
          className="block text-lg font-medium text-amber-900"
          style={{ fontFamily: '"Noto Sans TC", sans-serif' }}
        >
          請輸入書籍連結，開始對話
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="flex-1 p-4 border rounded-lg text-black border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
            placeholder="https://..."
            style={{ fontFamily: '"Noto Sans TC", sans-serif' }}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !url}
            className={`px-8 py-4 bg-amber-600 text-white rounded-lg transition-colors text-lg
                  ${
                    isLoading || !url
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-amber-700"
                  }`}
            style={{ fontFamily: '"Noto Sans TC", sans-serif' }}
          >
            {isLoading ? "處理中..." : "開始對話"}
          </button>
        </div>
      </div>
    </div>
  );
}
