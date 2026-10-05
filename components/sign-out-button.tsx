"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({
  variant = "ghost",
  iconOnly = false,
  className,
}: {
  variant?: ButtonProps["variant"];
  iconOnly?: boolean;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      size={iconOnly ? "icon" : "sm"}
      className={cn(className)}
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
      aria-label="Αποσύνδεση"
    >
      <LogOut className="h-4 w-4" />
      {iconOnly ? null : "Αποσύνδεση"}
    </Button>
  );
}
