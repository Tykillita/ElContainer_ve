import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	// Mostrar error visible en consola y en la UI si es posible
	const msg = `\n[Supabase] ERROR: Variables de entorno faltantes.\nVITE_SUPABASE_URL: ${supabaseUrl}\nVITE_SUPABASE_ANON_KEY: ${supabaseKey}\n`;
	if (typeof window !== 'undefined') {
		// Mostrar overlay en la web para facilitar debug en producción
		const div = document.createElement('div');
		div.style.position = 'fixed';
		div.style.top = '0';
		div.style.left = '0';
		div.style.width = '100vw';
		div.style.height = '100vh';
		div.style.background = '#1a1a1a';
		div.style.color = '#fff';
		div.style.display = 'flex';
		div.style.flexDirection = 'column';
		div.style.alignItems = 'center';
		div.style.justifyContent = 'center';
		div.style.zIndex = '9999';
		div.innerHTML = `<h1 style='font-size:2rem;margin-bottom:1rem;'>Error de configuración Supabase</h1><p>No se pudo inicializar el cliente.<br>Variables de entorno faltantes.<br><code>VITE_SUPABASE_URL</code> o <code>VITE_SUPABASE_ANON_KEY</code> no están definidas.<br><br>Revisa la configuración en Vercel y vuelve a desplegar.</p><pre style='margin-top:1rem;font-size:1rem;color:#ffb4b4;'>${msg}</pre>`;
		document.body.appendChild(div);
	}
	throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
