"use client";

import React, { useRef, useEffect } from "react";

interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  onChange?: (value: string) => void;
  allowNegative?: boolean;
  allowDecimals?: boolean;
  maxDecimals?: number;
}

export function NumericInput({
  onChange,
  allowNegative = false,
  allowDecimals = true,
  maxDecimals = 2,
  value,
  ...props
}: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const sanitizeInput = (inputValue: string): string => {
    if (!inputValue) return "";

    let sanitized = inputValue;

    // Remove any non-numeric characters except decimal point and minus sign
    sanitized = sanitized.replace(/[^\d.-]/g, "");

    // Handle multiple decimal points - keep only the first one
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }

    // Handle multiple minus signs - keep only at the start
    if (allowNegative) {
      const minusCount = (sanitized.match(/-/g) || []).length;
      if (minusCount > 1) {
        sanitized = sanitized.replace(/-/g, "");
        sanitized = "-" + sanitized;
      }
      // Ensure minus is only at the start
      if (sanitized.indexOf("-") !== 0 && sanitized.includes("-")) {
        sanitized = sanitized.replace(/-/g, "");
      }
    } else {
      sanitized = sanitized.replace(/-/g, "");
    }

    // Limit decimal places
    if (allowDecimals && sanitized.includes(".")) {
      const [integerPart, decimalPart] = sanitized.split(".");
      if (decimalPart.length > maxDecimals) {
        sanitized = `${integerPart}.${decimalPart.slice(0, maxDecimals)}`;
      }
    } else if (!allowDecimals) {
      sanitized = sanitized.replace(/\./g, "");
    }

    return sanitized;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.value = sanitized;
    }
    onChange?.(sanitized);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;

    // Allow control keys
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Allow numbers
    if (/^\d$/.test(char)) {
      return;
    }

    // Allow decimal point
    if (allowDecimals && char === ".") {
      const input = e.currentTarget;
      // Only allow one decimal point
      if (!input.value.includes(".")) {
        return;
      }
    }

    // Allow minus sign
    if (allowNegative && char === "-") {
      const input = e.currentTarget;
      // Only allow minus at the start
      if (input.selectionStart === 0 && !input.value.includes("-")) {
        return;
      }
    }

    // Prevent all other characters
    e.preventDefault();
  };

  // Initialize input value
  useEffect(() => {
    if (inputRef.current && value !== undefined && value !== null) {
      const sanitized = sanitizeInput(String(value));
      inputRef.current.value = sanitized;
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      defaultValue={value}
      {...props}
    />
  );
}
