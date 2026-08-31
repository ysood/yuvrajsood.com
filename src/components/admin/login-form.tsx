"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useActionState, useState } from "react";

import { loginAction, type LoginState } from "@/app/(frontend)/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            aria-describedby="login-message"
            autoComplete="current-password"
            autoFocus
            className="h-11 pr-11"
            disabled={pending}
            id="password"
            maxLength={100}
            name="password"
            required
            type={showPassword ? "text" : "password"}
          />
          <Button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1 top-1 bg-transparent hover:bg-transparent"
            disabled={pending}
            onClick={() => setShowPassword((visible) => !visible)}
            size="icon"
            type="button"
            variant="ghost"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      <div aria-live="polite" className="min-h-5" id="login-message">
        {state.message ? (
          <p className="text-sm text-destructive">
            {state.message}
            {state.retryAfterSeconds
              ? ` (${Math.ceil(state.retryAfterSeconds / 60)} min)`
              : ""}
          </p>
        ) : null}
      </div>

      <Button className="h-11 w-full" disabled={pending} type="submit">
        {pending ? <LoaderCircle className="animate-spin" /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
