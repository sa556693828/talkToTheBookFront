"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BiBookOpen } from "react-icons/bi";
import { IoLibrary } from "react-icons/io5";

export default function ChatPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 驗證URL格式
    const taazeUrlPattern = /^https:\/\/www\.taaze\.tw\/products\//;
    if (!url || !taazeUrlPattern.test(url)) {
      alert("請輸入有效的TAAZE商品連結");
      setIsLoading(false);
      return;
    }

    try {
      const env = process.env.NODE_ENV;
      const baseUrl =
        env === "development"
          ? process.env.NEXT_PUBLIC_DEVELOPMENT_URL
          : process.env.NEXT_PUBLIC_PRODUCTION_URL;

      // 使用 component 的 isDeepSeek state 來決定 API 路徑
      const apiPath = "/upsert_data";
      const apiUrl = `${baseUrl}${apiPath}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          book_link: url,
        }),
      });
      if (!response.ok) {
        alert("解析內容失敗，請重新上傳有效的TAAZE商品連結");
        setIsLoading(false);
        return;
      }

      const encodedUrl = encodeURIComponent(url);
      router.push(`/dschat/${encodedUrl}`);
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
          請輸入書籍連結，解析完內容後，開始對話
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            pattern="https://www\.taaze\.tw/products/.*"
            className="flex-1 p-4 border rounded-lg text-black border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
            placeholder="https://www.taaze.tw/products/..."
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
