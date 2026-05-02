import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Conversation = {
  phone: string;
  name?: string | null;
  ai_enabled?: boolean | null;
  escalated?: boolean | null;
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count?: number | null;
};

function isAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  return password === ADMIN_PASSWORD;
}

function sortConversations(conversations: Conversation[]) {
  return [...conversations].sort((a, b) => {
    // 1. Chats needing human attention always first
    if (Boolean(a.escalated) !== Boolean(b.escalated)) {
      return Boolean(a.escalated) ? -1 : 1;
    }

    // 2. Then unread chats
    const aUnread = Number(a.unread_count || 0);
    const bUnread = Number(b.unread_count || 0);

    if (aUnread !== bUnread) {
      return bUnread - aUnread;
    }

    // 3. Then latest message time
    const aTime = new Date(a.last_message_at || 0).getTime();
    const bTime = new Date(b.last_message_at || 0).getTime();

    return bTime - aTime;
  });
}

export async function GET(req: NextRequest) {
  try {
    console.log("CONVERSATIONS API HIT");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase env variables");
      return NextResponse.json(
        { error: "Missing Supabase env variables" },
        { status: 500 }
      );
    }

    if (!ADMIN_PASSWORD) {
      console.error("Missing ADMIN_PASSWORD env variable");
      return NextResponse.json(
        { error: "Missing ADMIN_PASSWORD env variable" },
        { status: 500 }
      );
    }

    if (!isAuth(req)) {
      console.log("Unauthorized admin request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("whatsapp_contacts")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Supabase conversations error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const sortedConversations = sortConversations((data || []) as Conversation[]);

    return NextResponse.json({
      ok: true,
      conversations: sortedConversations,
    });
  } catch (error) {
    console.error("Conversations route error:", error);
    return NextResponse.json(
      { error: "Server error loading conversations" },
      { status: 500 }
    );
  }
}