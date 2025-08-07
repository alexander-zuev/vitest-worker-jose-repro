import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// Create a simple in-memory SQLite database
const sqlite = new Database(":memory:");
const db = drizzle(sqlite);

// This will import jose internally
const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite"
  })
});

export default {
  async fetch(request: Request, env: any, ctx: any) {
    // Try to handle auth routes - this uses jose internally
    const authResponse = await auth.handler(request);
    if (authResponse) return authResponse;
    
    return new Response("Hello World!");
  }
};