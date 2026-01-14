import React from 'react';

interface AdminPanelFilterProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const roleColors: Record<string, string> = {
  todos: 'bg-orange-400',
  admin: 'bg-fuchsia-400',
  it: 'bg-blue-400',
  cliente: 'bg-orange-400',
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const AdminPanelFilter: React.FC<AdminPanelFilterProps> = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mb-6" ref={ref}>
      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1">
        <span className={`h-2 w-2 rounded-full ${roleColors[value]} shadow-[0_0_12px_rgba(249,115,22,0.65)]`} />
        <span className="text-xs text-white/90">
          {value === 'todos'
            ? 'Mostrando todos los roles'
            : `Filtrando por: ${capitalize(value)}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/60">Filtrar rol</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-white/10 px-4 py-2 text-sm text-white shadow-sm transition-all hover:border-orange-400/60 hover:shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
          >
            <span className="truncate max-w-[120px] text-left">{capitalize(value)}</span>
            <div className="flex items-center gap-1 text-white/70">
              <span className={`h-1.5 w-1.5 rounded-full transition-opacity ${isOpen ? 'bg-orange-400 opacity-100 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-white/50 opacity-60'}`} />
            </div>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-black/90 via-black/85 to-black/90 backdrop-blur shadow-xl shadow-black/40 z-20">
              <ul className="divide-y divide-white/5">
                {options.map(opt => (
                  <li key={opt}>
                    <button
                      className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors ${value === opt ? 'bg-white/5 text-white' : 'text-white/80 hover:bg-white/5'}`}
                      onClick={() => { onChange(opt); setIsOpen(false); }}
                    >
                      <span className="truncate pr-2">{capitalize(opt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelFilter;
