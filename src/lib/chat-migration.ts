export function migrateOldChatData(): void {
  const chatTypes = ["domain", "framework", "simulation"];

  for (const type of chatTypes) {
    const key = `traza-chat-${type}`;
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const messages = JSON.parse(raw);
      if (!Array.isArray(messages) || messages.length === 0) continue;

      const firstMsg = messages[0];
      const isOldFormat =
        typeof firstMsg.content === "string" && !firstMsg.parts;

      if (isOldFormat) {
        localStorage.setItem(`traza-backup-${type}`, raw);
        localStorage.removeItem(key);
        console.log(
          `[traza-migration] Backed up old ${type} chat data to traza-backup-${type}`
        );
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
}
