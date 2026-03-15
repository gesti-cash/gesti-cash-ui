"use client";

import * as React from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** Optional: custom label for selected option (e.g. with extra info) */
  getOptionLabel?: (opt: SearchableSelectOption) => string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Sélectionner…",
  emptyMessage = "Aucun résultat",
  searchPlaceholder = "Rechercher…",
  disabled = false,
  id,
  className,
  getOptionLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption
    ? getOptionLabel
      ? getOptionLabel(selectedOption)
      : selectedOption.label
    : "";

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const handleSelect = (opt: SearchableSelectOption) => {
    onChange(opt.value);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((o) => !o);
            if (!open) setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        onBlur={() => onBlur?.()}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
          disabled && "cursor-not-allowed opacity-50",
          open && "ring-2 ring-indigo-500/30 border-indigo-500/50"
        )}
      >
        <span className={cn(!displayLabel && "text-zinc-500 dark:text-zinc-400")}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-zinc-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-72 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 p-2">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {emptyMessage}
              </p>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                    opt.value === value
                      ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  )}
                >
                  {getOptionLabel ? getOptionLabel(opt) : opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
