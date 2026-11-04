"use client";

import { FormEvent, useState } from "react";

const MESSAGES: Record<string, string> = {
  subscribed: "구독해 주셔서 감사합니다. 새 소식을 이메일로 전해드릴게요.",
  exists: "이미 구독 중인 이메일이에요.",
  invalid: "이메일 주소를 다시 확인해 주세요.",
  error: "잠시 후 다시 시도해 주세요.",
};

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: window.location.pathname }),
      });
      const result = (await response.json().catch(() => null)) as {
        status?: string;
      } | null;
      const status = result?.status ?? "error";

      setMessage(MESSAGES[status] ?? MESSAGES.error);

      if (status === "subscribed" || status === "exists") {
        setEmail("");
      }
    } catch {
      setMessage(MESSAGES.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="newsletter-field">
        <input
          aria-label="이메일 주소"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        {message ? <small>{message}</small> : null}
      </div>
      <button disabled={submitting} type="submit">
        {submitting ? "신청 중..." : "구독하기"}
      </button>
    </form>
  );
}
