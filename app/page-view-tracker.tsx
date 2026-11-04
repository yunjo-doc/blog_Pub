"use client";

import { useEffect } from "react";

type PageViewTrackerProps = {
  path: string;
  slug?: string;
  title?: string;
};

export default function PageViewTracker({
  path,
  slug,
  title,
}: PageViewTrackerProps) {
  useEffect(() => {
    const storageKey = `page-view:${path}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "1");

    fetch("/api/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path, slug, title }),
      keepalive: true,
    }).catch(() => {});
  }, [path, slug, title]);

  return null;
}