"use client";
import Link from "next/link";
import { IoLogOut } from "react-icons/io5";
import { useAuthStore } from "@/store/useAuthStore";
export default function Header() {
  const { logout } = useAuthStore();
  return (
    <header className="h-[60px] p-8 border-b border-amber-200 flex justify-between items-center bg-white/80 backdrop-blur">
      <Link href="/">
        <h1 className="text-2xl font-bold text-amber-900">Talk to the book</h1>
      </Link>
      <button
        className="text-amber-900 px-4 h-[30px] rounded-md border border-amber-900"
        onClick={logout}
      >
        登出
      </button>
    </header>
  );
}
