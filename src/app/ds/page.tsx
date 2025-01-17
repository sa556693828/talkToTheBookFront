"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { BiUser } from "react-icons/bi";
import { IoLogOut } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function DSLogin() {
  const [username, setUsername] = useState("");
  const { login, isAuthenticated, user, logout, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isOk = await login(username, username);
      if (isOk) {
        router.push("/chat_ds");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName) {
      router.push("/chat_ds");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div>
      <header className="p-6 text-center">
        <h1
          className="text-4xl font-bold text-amber-900 mb-3"
          style={{ fontFamily: '"Noto Serif TC", serif' }}
        >
          系統登入
        </h1>
        <p
          className="text-amber-700 text-lg"
          style={{ fontFamily: '"Noto Sans TC", sans-serif' }}
        >
          歡迎回來，請輸入您的用戶名
        </p>
      </header>

      {/* 其餘登入表單內容與原始檔案相同 */}
      <div className="max-w-2xl mx-auto mt-12 p-6">
        <div className="card p-8 bg-white/80 backdrop-blur">
          {!isAuthenticated ? (
            <>
              <div className="flex items-center justify-center mb-8">
                {isLoading ? (
                  <BiUser className="w-16 h-16 text-amber-900 animate-bounce" />
                ) : (
                  <BiUser className="w-16 h-16 text-amber-900" />
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 表單內容與原始檔案相同 */}
                <div>
                  <label
                    className="block text-lg font-medium text-amber-900"
                    style={{ fontFamily: '"Noto Sans TC", sans-serif' }}
                  >
                    用戶名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-4 mt-2 border rounded-lg border-amber-200 focus:ring-2 focus:ring-amber-500 text-black focus:border-transparent"
                    placeholder="請輸入用戶名"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full p-4 rounded-lg text-white text-lg transition-colors
                    ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                  style={{ fontFamily: '"Noto Sans TC", sans-serif' }}
                >
                  {isLoading ? "登入中..." : "登入"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <BiUser className="w-16 h-16 text-amber-700 mx-auto" />
              <h2 className="text-2xl text-amber-900">歡迎回來，{user}！</h2>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full p-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <IoLogOut className="w-5 h-5" />
                <span>登出</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
