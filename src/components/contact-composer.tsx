"use client";

import { ArrowUpRight, ChevronRight, Mail } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { regexes } from "zod/v4/core";

import { sendContactMessage, type ContactState } from "@/app/(frontend)/contact/actions";
import styles from "@/app/(frontend)/contact/contact.module.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ContactState = { status: "idle" };

export function ContactComposer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, send, pending] = useActionState(sendContactMessage, initialState);
  const requestId = useRef<string | null>(null);
  const hasValidEmail = regexes.email.test(email.trim());

  return (
    <div className="mt-4 overflow-hidden rounded-[6px] border bg-card font-mono text-card-foreground">
      {state.status === "sent" ? (
        <p className="px-3 py-4 text-center text-xs" ref={(node) => node?.focus()} tabIndex={-1}>
          Message sent.
        </p>
      ) : (
        <form
          action={(formData) => {
            if (!hasValidEmail) return;
            requestId.current ??= crypto.randomUUID();
            formData.set("requestId", requestId.current);
            send(formData);
          }}
          aria-busy={pending}
        >
          <label className="group grid grid-cols-[0.75rem_minmax(0,1fr)] items-center gap-2 px-3 py-1.5">
            <Mail aria-hidden="true" className="size-3 text-muted-foreground group-focus-within:text-foreground" strokeWidth={1.5} />
            <Input
              aria-label="From email"
              autoComplete="email"
              className="h-6 rounded-[3px] border-0 bg-transparent px-0 text-[11px]/4 text-foreground shadow-none focus-visible:ring-0 md:text-[11px]/4 dark:bg-transparent"
              maxLength={254}
              name="email"
              onChange={(event) => {
                requestId.current = null;
                setEmail(event.target.value);
              }}
              placeholder="your email"
              readOnly={pending}
              required
              type="email"
              value={email}
            />
          </label>
          <div aria-hidden="true" className="sr-only">
            <label>Website<input autoComplete="off" name="contactWebsite" tabIndex={-1} /></label>
          </div>
          {hasValidEmail && (
            <div className={styles.reveal}>
              <div>
                <label className="group grid grid-cols-[0.75rem_minmax(0,1fr)] items-start gap-2 border-t px-3 py-1">
                  <ChevronRight aria-hidden="true" className="mt-3 size-3 text-muted-foreground group-focus-within:text-foreground" strokeWidth={1.5} />
                  <span className={`text-xs ${styles.messageEditor}`} data-message={message}>
                    <Textarea
                      aria-label="Message"
                      className="resize-none overflow-y-auto rounded-[3px] border-0 bg-transparent px-0 text-xs text-foreground shadow-none focus-visible:ring-0 md:text-xs dark:bg-transparent"
                      maxLength={3000}
                      name="message"
                      onChange={(event) => {
                        requestId.current = null;
                        setMessage(event.target.value);
                      }}
                      placeholder="write your message…"
                      readOnly={pending}
                      required
                      value={message}
                    />
                  </span>
                </label>
                <div className="flex flex-wrap items-center justify-end gap-x-2 border-t px-3 py-1.5">
                  {state.status === "error" && !pending && (
                    <p className="grow px-1 py-1 text-xs text-muted-foreground" role="alert">{state.message}</p>
                  )}
                  <button
                    className="ml-auto inline-flex min-h-6 min-w-6 cursor-pointer items-center gap-1.5 bg-transparent text-[11px]/4 underline-offset-2 enabled:hover:underline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:opacity-50"
                    disabled={pending}
                    type="submit"
                  >
                    {pending ? "sending…" : "send"}
                    <ArrowUpRight aria-hidden="true" className="size-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
