"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-fit gap-2 px-4 h-11 text-base font-medium cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
      onClick={() => router.back()}
    >
      <ChevronLeft className="w-5 h-5" />
      Voltar
    </Button>
  );
}
