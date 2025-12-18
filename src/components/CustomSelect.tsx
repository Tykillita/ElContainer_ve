import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Selecciona...',
  className = ''
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      {label && <label className="block mb-1 text-sm text-white/80">{label}</label>}
      <button
        type="button"
        className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.10)] transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ fontWeight: 500, fontFamily: 'inherit', minHeight: 40 }}
      >
        <span className={selected ? '' : 'text-white/40'}>{selected ? selected.label : placeholder}</span>
        <svg className={`ml-2 h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute z-50 mt-1 w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] max-h-56 overflow-auto animate-fade-in"
          tabIndex={-1}
          role="listbox"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`px-4 py-2 text-sm cursor-pointer select-none transition-colors rounded-lg mx-1 my-1 ${
                value === opt.value
                  ? 'bg-orange-500/90 text-white font-semibold shadow-md'
                  : 'text-white/90 hover:bg-orange-400/20 hover:text-white'
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={value === opt.value}
              style={{ fontFamily: 'inherit' }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
