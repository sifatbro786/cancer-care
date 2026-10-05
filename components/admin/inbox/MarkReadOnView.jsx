"use client";

import { useEffect, useRef } from "react";
import { markMessageReadAction } from "@/app/(admin)/_actions/inbox";

/**
 * Marks an unread message as read once it has been opened.
 * Done from the client (a Server Action) because rendering must not mutate data.
 */
export default function MarkReadOnView({ id }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    markMessageReadAction(id);
  }, [id]);
  return null;
}
