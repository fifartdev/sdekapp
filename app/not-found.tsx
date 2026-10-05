import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-bold">Η σελίδα δεν βρέθηκε</h1>
      <Button asChild>
        <Link href="/">Αρχική</Link>
      </Button>
    </div>
  );
}
