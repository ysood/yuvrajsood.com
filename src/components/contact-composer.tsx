"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const addressRow = "grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-1 border-b px-3 py-1.5 text-xs";

export function ContactComposer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const messageField = useRef<HTMLTextAreaElement>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const editing = useRef(false);

  useEffect(() => {
    if (preview) {
      previewHeading.current?.focus();
    } else if (editing.current) {
      messageField.current?.focus();
      editing.current = false;
    }
  }, [preview]);

  function showPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      messageField.current?.setCustomValidity("Please write a message.");
      messageField.current?.reportValidity();
      return;
    }
    setPreview(true);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border bg-card text-card-foreground">
      {!preview ? (
        <form method="post" onSubmit={showPreview}>
          <p className={`${addressRow} py-2.5`}>
            <span className="text-muted-foreground">to</span>
            <span>Yuvraj Sood</span>
          </p>
          <label className={`${addressRow} text-muted-foreground`}>
            from
            <Input
              aria-label="From email"
              autoComplete="email"
              className="h-7 rounded-sm border-0 bg-transparent px-1 text-foreground shadow-none dark:bg-transparent"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <div className="p-2">
            <Textarea
              aria-label="Message"
              className="field-sizing-fixed min-h-28 resize-y rounded-sm border-0 bg-transparent px-1 shadow-none dark:bg-transparent"
              maxLength={3000}
              onChange={(event) => {
                event.target.setCustomValidity("");
                setMessage(event.target.value);
              }}
              placeholder="Write your message…"
              ref={messageField}
              required
              value={message}
            />
          </div>
          <div className="flex justify-end border-t px-2 py-1.5">
            <Button className="text-xs font-normal" size="sm" type="submit" variant="ghost">
              preview message <ArrowUpRight aria-hidden="true" className="size-3" />
            </Button>
          </div>
        </form>
      ) : (
        <section aria-labelledby="contact-preview-title">
          <h2 className="border-b px-3 py-2.5 text-xs font-normal" id="contact-preview-title" ref={previewHeading} tabIndex={-1}>
            Message preview
          </h2>
          <p className={`${addressRow} py-2.5`}>
            <span className="text-muted-foreground">from</span>
            <span className="wrap-anywhere">{email.trim()}</span>
          </p>
          <p className="min-h-24 px-3 py-3 text-sm whitespace-pre-wrap wrap-anywhere">{message.trim()}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t py-1.5 pr-2 pl-3">
            <p className="text-xs text-muted-foreground">Preview only</p>
            <Button
              className="text-xs font-normal"
              onClick={() => {
                editing.current = true;
                setPreview(false);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              edit message
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
