"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname } from "next/navigation";

export default function Header() {
  const { logout } = useAuthStore();
  const pathname = usePathname();

  // 根據路徑決定標題
  const getTitle = () => {
    if (pathname?.startsWith("/chat_ds")) {
      return "Talk To The Book D";
    } else if (pathname?.startsWith("/chat")) {
      return "Talk To The Book";
    }
    return "Talk To The Book";
  };

  return (
    <header className="h-[60px] p-8 border-b border-amber-200 flex justify-between items-center bg-white/80 backdrop-blur">
      <Link href="/">
        <h1 className="text-2xl font-bold text-amber-900">{getTitle()}</h1>
      </Link>

      <div className="flex items-center gap-4">
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
