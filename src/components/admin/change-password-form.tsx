"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  changePasswordAction,
  type PasswordState,
} from "@/app/(frontend)/admin/(portal)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PasswordState = {};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <section aria-labelledby="change-password-title" className="border-t pt-10">
      <div>
        <h2 className="font-medium" id="change-password-title">
          Change password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use at least 8 characters.
        </p>
      </div>
      <form action={action} className="mt-5 max-w-sm space-y-4" ref={formRef}>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            autoComplete="new-password"
            disabled={pending}
            id="new-password"
            maxLength={100}
            minLength={8}
            name="newPassword"
            required
            type="password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            autoComplete="new-password"
            disabled={pending}
            id="confirm-password"
            maxLength={100}
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button disabled={pending} type="submit">
            {pending ? "Changing…" : "Confirm"}
          </Button>
          <p
            aria-live="polite"
            className={state.error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
          >
            {state.error || state.success}
          </p>
        </div>
      </form>
    </section>
  );
}
