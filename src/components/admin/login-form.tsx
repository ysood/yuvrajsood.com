"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/(frontend)/admin/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="w-full max-w-xs space-y-2">
      <div className="space-y-2">
        <Label className="text-xs font-normal text-muted-foreground" htmlFor="password">
          Enter password
        </Label>
        <Input
          aria-describedby="login-message"
          autoComplete="current-password"
          autoFocus
          className="h-10"
          disabled={pending}
          id="password"
          maxLength={100}
          name="password"
          required
          type="password"
        />
      </div>

      <div aria-live="polite" id="login-message">
        {state.message ? (
          <p className="text-xs text-destructive">
            {state.message}
            {state.retryAfterSeconds
              ? ` (${Math.ceil(state.retryAfterSeconds / 60)} min)`
              : ""}
          </p>
        ) : null}
      </div>
    </form>
  );
}
