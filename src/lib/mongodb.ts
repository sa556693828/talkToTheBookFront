import mongoose from "mongoose";

// 定義緩存類型
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 定義全局類型
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined; // 這裡需要使用 var
}

if (!process.env.MONGODB_URI) {
  throw new Error("請在 .env 文件中添加 MONGODB_URI");
}

const MONGODB_URI = process.env.MONGODB_URI;

// 初始化緩存
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
