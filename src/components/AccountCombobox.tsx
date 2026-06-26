"use client";

import { useEffect, useRef, useState } from "react";

interface Account {
  id: string;
  name: string;
}

interface Props {
  accounts: Account[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function AccountCombobox({
  accounts,
  value,
  onChange,
  placeholder = "Search accounts...",
  required = false,
}: Props) {
  const [inputText, setInputText] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update input text when value changes (e.g., on mount or when parent updates)
  useEffect(() => {
    const selected = accounts.find((acc) => acc.id === value);
    setInputText(selected?.name || "");
  }, [value, accounts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const filtered = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(inputText.toLowerCase())
  );

  const handleInputChange = (text: string) => {
    setInputText(text);
    setOpen(true);
    setHighlighted(-1);
    if (!text) {
      onChange("");
    }
  };

  const handleSelect = (id: string) => {
    onChange(id);
    const selected = accounts.find((acc) => acc.id === id);
    setInputText(selected?.name || "");
    setOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && e.key !== "ArrowDown") return;

    switch (e.key) {
      case "Escape":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setHighlighted((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlighted >= 0 && filtered[highlighted]) {
          handleSelect(filtered[highlighted].id);
        }
        break;
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        required={required && !value}
        value={inputText}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-zinc-400 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-zinc-500 dark:focus:border-slate-400 dark:focus:ring-slate-400"
      />

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
          {filtered.map((acc, idx) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => handleSelect(acc.id)}
              onMouseEnter={() => setHighlighted(idx)}
              className={`block w-full px-3 py-2 text-left text-sm transition ${
                idx === highlighted
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                  : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              } hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              {acc.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
