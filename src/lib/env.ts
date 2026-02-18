let _validated = false;

export function getServerEnv() {
  if (!_validated) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key.length < 10) {
      throw new Error(
        "ANTHROPIC_API_KEY is missing or invalid. Set it in .env.local"
      );
    }
    _validated = true;
  }
  return {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
  };
}
