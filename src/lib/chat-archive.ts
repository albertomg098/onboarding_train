import type { UIMessage } from "ai";
import type { ChatType } from "./prompt-store";

export interface ChatArchive {
  id: string;
  timestamp: number;
  messages: UIMessage[];
  messageCount: number;
  preview: string;
}

const MAX_ARCHIVES = 5;
const PREVIEW_LENGTH = 80;

function getStorageKey(type: ChatType): string {
  return `traza-archives-${type}`;
}

export function archiveChat(type: ChatType, messages: UIMessage[]): void {
  if (messages.length === 0) return;

  const archives = getArchives(type);

  const firstUserMsg = messages.find((m) => m.role === "user");
  let preview = "...";
  if (firstUserMsg?.parts) {
    const textPart = firstUserMsg.parts.find((p) => p.type === "text");
    if (textPart && "text" in textPart) {
      preview = textPart.text.slice(0, PREVIEW_LENGTH);
    }
  }

  archives.push({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    messages,
    messageCount: messages.length,
    preview,
  });

  while (archives.length > MAX_ARCHIVES) archives.shift();

  try {
    localStorage.setItem(getStorageKey(type), JSON.stringify(archives));
  } catch {
    archives.shift();
    try {
      localStorage.setItem(getStorageKey(type), JSON.stringify(archives));
    } catch {
      // localStorage truly full — silently fail
    }
  }
}

export function getArchives(type: ChatType): ChatArchive[] {
  try {
    const raw = localStorage.getItem(getStorageKey(type));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function restoreArchive(
  type: ChatType,
  archiveId: string
): UIMessage[] | null {
  const archives = getArchives(type);
  return archives.find((a) => a.id === archiveId)?.messages ?? null;
}

export function deleteArchive(type: ChatType, archiveId: string): void {
  const archives = getArchives(type).filter((a) => a.id !== archiveId);
  localStorage.setItem(getStorageKey(type), JSON.stringify(archives));
}
