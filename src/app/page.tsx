"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <header className="p-6 text-center">
        <h1
          className="text-4xl font-bold text-amber-900 mb-3"
          style={{ fontFamily: '"Noto Serif TC", serif' }}
        >
          系統選擇
        </h1>
        <p
          className="text-amber-700 text-lg"
          style={{ fontFamily: '"Noto Sans TC", sans-serif' }}
        >
          請選擇要進入的系統
        </p>
      </header>

      <div className="max-w-2xl mx-auto mt-12 p-6">
        <div className="p-8 bg-white/80 backdrop-blur flex flex-col gap-4">
          <Link href="/ds">
            <button className="w-full p-6 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xl transition-colors">
              DS 系統
            </button>
          </Link>
          <Link href="/4o">
            <button className="w-full p-6 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xl transition-colors">
              4o 系統
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
