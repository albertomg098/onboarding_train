"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function ApiKeyWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/settings/api-key")
      .then((res) => res.json())
      .then((data: { valid: boolean }) => {
        if (!data.valid) setShow(true);
      })
      .catch(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <Alert variant="destructive" className="max-w-4xl w-full">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        No valid API key configured. Training chats will not work until you{" "}
        <Link href="/settings" className="underline font-medium">
          add an API key in settings
        </Link>
        .
      </AlertDescription>
    </Alert>
  );
}
