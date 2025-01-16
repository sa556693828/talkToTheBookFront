"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useModelStore } from "@/store/useModel";
import { usePathname } from "next/navigation";

export default function Header() {
  const { logout } = useAuthStore();
  const { isDeepSeek, setIsDeepSeek } = useModelStore();
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";
  return (
    <header className="h-[60px] p-8 border-b border-amber-200 flex justify-between items-center bg-white/80 backdrop-blur">
      <Link href="/">
        <h1 className="text-2xl font-bold text-amber-900">Talk to the book</h1>
      </Link>

      <div className="flex items-center gap-4">
        <button
          disabled={!isChatPage}
          onClick={() => setIsDeepSeek(!isDeepSeek)}
          className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
            isDeepSeek ? "bg-slate-700" : "bg-slate-300"
          } relative`}
        >
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-white z-10">
            ds
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-slate-600 z-10">
            4o
          </span>
          <div
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ease-in-out ${
              isDeepSeek ? "translate-x-[26px]" : "translate-x-0.5"
            } shadow-md z-20`}
          />
        </button>

        <button
          className="text-amber-900 px-4 h-[30px] rounded-md border border-amber-900"
          onClick={logout}
        >
          登出
        </button>
      </div>
    </header>
  );
}
