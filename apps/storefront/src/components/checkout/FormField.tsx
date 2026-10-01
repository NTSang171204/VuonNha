import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

interface InputProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'tel' | 'date' | 'email';
}

interface TextareaProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface SelectProps extends BaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function FormField({ label, required, hint, error, ...props }: InputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-primary ${
          error ? 'border-red-500' : 'border-line'
        }`}
      />
      {hint && !error && <p className="mt-1.5 text-[13px] text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-[13px] text-red-500">{error}</p>}
    </div>
  );
}

export function FormTextarea({ label, required, hint, error, ...props }: TextareaProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...props}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-primary ${
          error ? 'border-red-500' : 'border-line'
        }`}
      />
      {hint && !error && <p className="mt-1.5 text-[13px] text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-[13px] text-red-500">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, required, hint, error, options, ...props }: SelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-primary ${
          error ? 'border-red-500' : 'border-line'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="mt-1.5 text-[13px] text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-[13px] text-red-500">{error}</p>}
    </div>
  );
}
