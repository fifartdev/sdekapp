import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, LogIn } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export async function PublicHeader() {
  const user = await getCurrentUser();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/referees" className="flex items-center gap-3">
          <Image
            src="/logo-oseka.png"
            alt="ΟΣΕΚΑ"
            width={292}
            height={90}
            className="h-10 w-auto"
          />
          <span className="hidden text-sm font-semibold sm:inline">Ορισμοί Διαιτητών</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/referees"
            className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Διαιτητές
          </Link>
          <Link
            href="/komisarioi"
            className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Κομισάριοι
          </Link>
          <Button asChild variant="secondary" size="sm" className="ml-2">
            <Link href={user ? "/dashboard" : "/"}>
              {user ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {user ? "Πίνακας Ελέγχου" : "Σύνδεση"}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
