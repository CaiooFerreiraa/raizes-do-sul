"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface FlavorTagsInputProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export function FlavorTagsInput({
  name,
  defaultValue = "",
  placeholder = "Ex: Chocolate",
}: FlavorTagsInputProps) {
  const [tags, setTags] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return defaultValue
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  });
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(): void {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setInputValue("");
      inputRef.current?.focus();
    }
  }

  function removeTag(index: number): void {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  const hiddenValue = tags.join(",");

  return (
    <div className="space-y-3">
      {/* Hidden input para enviar ao formulário */}
      <input type="hidden" name={name} value={hiddenValue} />

      {/* Tags visuais */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                aria-label={`Remover ${tag}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + Botão adicionar */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-background rounded-xl h-10 px-4 shadow-inner text-sm flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="rounded-xl h-10 px-4 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/60">
        Pressione Enter ou clique em Adicionar para incluir cada sabor
      </p>
    </div>
  );
}
