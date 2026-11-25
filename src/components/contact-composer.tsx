"use client";

import { ArrowUpRight } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { sendContactMessage, type ContactState } from "@/app/(frontend)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const addressRow = "grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-1 border-b px-3 py-1.5 text-xs";
const initialState: ContactState = { status: "idle" };

export function ContactComposer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, send, pending] = useActionState(sendContactMessage, initialState);
  const requestId = useRef<string | null>(null);

  return (
    <div className="mt-4 overflow-hidden rounded-lg border bg-card text-card-foreground">
      {state.status === "sent" ? (
        <p className="px-3 py-4 text-center text-sm" ref={(node) => node?.focus()} tabIndex={-1}>
          Message sent.
        </p>
      ) : (
        <form
          action={(formData) => {
            requestId.current ??= crypto.randomUUID();
            formData.set("requestId", requestId.current);
            send(formData);
          }}
          aria-busy={pending}
        >
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
              maxLength={254}
              name="email"
              onChange={(event) => {
                requestId.current = null;
                setEmail(event.target.value);
              }}
              placeholder="you@example.com"
              readOnly={pending}
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
              name="message"
              onChange={(event) => {
                requestId.current = null;
                setMessage(event.target.value);
              }}
              placeholder="Write your message…"
              readOnly={pending}
              required
              value={message}
            />
          </div>
          <div aria-hidden="true" className="sr-only">
            <label>Website<input autoComplete="off" name="contactWebsite" tabIndex={-1} /></label>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-2 border-t px-2 py-1.5">
            {state.status === "error" && !pending && (
              <p className="grow px-1 py-1 text-xs text-muted-foreground" role="alert">{state.message}</p>
            )}
            <Button className="ml-auto text-xs font-normal" disabled={pending} size="sm" type="submit" variant="ghost">
              {pending ? "sending…" : "send email"} <ArrowUpRight aria-hidden="true" className="size-3" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
