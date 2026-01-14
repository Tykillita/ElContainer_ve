
import React, { useState, useEffect } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';
import { CalendarDays } from 'lucide-react';

const ProgresoCliente: React.FC = () => {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState<number[]>([]);
  useEffect(() => {
    if (!user) return;
    async function fetchStamps() {
      const userId = user?.id;
      if (!userId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('stamps')
        .eq('id', userId)
        .single();
      if (!error && data && typeof data.stamps === 'number') {
        setRevealed(Array.from({ length: data.stamps }, (_, i) => i));
      } else {
        setRevealed([]);
      }
    }
    fetchStamps();
  }, [user]);

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold mb-4">Mi Progreso</h1>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-white/80 text-sm">Días con sello obtenido</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {revealed.length === 0 ? (
                <span className="text-xs text-white/50">Aún no has obtenido sellos.</span>
              ) : (
                revealed.map((idx) => (
                  <span key={idx} className="rounded-full bg-orange-500/20 text-orange-300 px-3 py-1 text-xs font-semibold">
                    Sello #{idx + 1}
                  </span>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </MobileScaleWrapper>
  );
};

export default ProgresoCliente;
