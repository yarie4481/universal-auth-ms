"use client";

import { useState } from "react";

interface SecretFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

export function SecretField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  required,
}: SecretFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          className="field font-mono"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn-secondary shrink-0"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-ink-600/70">{hint}</p> : null}
    </div>
  );
}
