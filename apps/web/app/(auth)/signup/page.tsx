"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { PasswordField, TextField } from "@/components/Field";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { signup } from "@/services/auth";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const longEnough = pw.length >= 8;
  const match = pw2.length > 0 && pw === pw2;
  const ok = name.trim() && id.trim().length >= 3 && longEnough && match;

  const m = useMutation({
    mutationFn: () => signup({ name: name.trim(), identifier: id.trim(), password: pw }),
    onSuccess: () => router.push("/onboarding"),
  });

  return (
    <Screen gap="gap-0">
      <ScreenHeader title="Sign up" fallback="/welcome" />
      <h1 className="m-0 mt-5 text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">Create your account</h1>
      <p className="m-0 mt-1.5 text-[16px] leading-normal text-muted text-pretty">Save your results and see how your eyes change over time.</p>
      <form
        className="mt-[22px] flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) m.mutate();
        }}
      >
        <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
        <TextField label="Phone or email" value={id} onChange={(e) => setId(e.target.value)} placeholder="+91 98765 43210 or you@example.com" autoComplete="username" />
        <PasswordField
          id="pw"
          label="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          hint={
            <span className={cn("flex items-center gap-1.5 text-[13px] transition-colors", longEnough ? "text-good" : "text-[#8A8A85]")}>
              <Icon name="check" size={14} strokeWidth={2.2} />
              At least 8 characters
            </span>
          }
        />
        <PasswordField
          id="pw2"
          label="Confirm password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          placeholder="Type it again"
          autoComplete="new-password"
          hint={
            <span className={cn("min-h-[18px] text-[13px]", match ? "text-good" : "text-mild")}>
              {pw2 ? (match ? "Passwords match" : "Passwords don't match yet") : ""}
            </span>
          }
        />
        <button type="submit" hidden />
      </form>
      <Spacer />
      {m.isError && <p className="m-0 mb-3 text-center text-[14px] text-doc">{m.error.message || "Couldn't create your account. Try again."}</p>}
      <Button disabled={!ok || m.isPending} onClick={() => ok && m.mutate()}>
        {m.isPending ? "Creating account…" : "Create account"}
      </Button>
      <p className="m-0 mt-3.5 text-center text-[15px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-ink">
          Log in
        </Link>
      </p>
    </Screen>
  );
}
