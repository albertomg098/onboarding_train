"use client";

import { useEffect } from "react";
import { migrateOldChatData } from "@/lib/chat-migration";

export function ChatMigrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateOldChatData();
  }, []);
  return <>{children}</>;
}
