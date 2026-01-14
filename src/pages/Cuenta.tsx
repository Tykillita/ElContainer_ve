import { UserRound, Mail, BadgeCheck, CalendarDays, Phone as PhoneIcon } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/useAuth';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL } from '../context/AuthContext';
import { Loader2, Save, Upload } from 'lucide-react';
import PhoneNumberInput from '../components/PhoneNumberInput';

type FormState = {
  nombre: string;
  phone: string;
  avatar_icon: string;
  avatar_url: string;
  avatar_path: string;
  bio: string;
};

type ProfileLite = {
  full_name: string | null;
  phone: string | null;
};

export default function Cuenta() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [form, setForm] = useState<FormState>({ nombre: '', phone: '', avatar_icon: 'default', avatar_url: '', bio: '', avatar_path: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const avatarPreview = useMemo(() => resolveAvatarUrl({ ...user?.user_metadata, ...form }), [user, form]);
  const isDefaultAvatar = avatarPreview === DEFAULT_AVATAR_URL;

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!user) return;
      const meta = user.user_metadata || {};
      const fullNameMeta = (meta.full_name as string | undefined) || [meta.nombre, meta.apellido].filter(Boolean).join(' ').trim();

      // Preferimos datos de profiles (lo que usa AdminPanel y otras vistas)
      let profile: ProfileLite | null = null;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle();
      profile = (profileData ?? null) as ProfileLite | null;
      if (!active) return;

      setForm({
        nombre: profile?.full_name || fullNameMeta || meta.nombre || user.email || '',
        phone: profile?.phone || meta.phone || '',
        avatar_icon: (meta.avatar_icon as string) || 'default',
        avatar_url: meta.avatar_url || meta.picture || '',
        bio: meta.bio || '',
        avatar_path: meta.avatar_path || ''
      });
    };
    run();
    return () => {
      active = false;
    };
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'El archivo supera 2MB' });
      e.target.value = '';
      return;
    }
    setUploading(true);
    setStatus(null);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    });
    if (uploadError) {
      setStatus({ type: 'error', message: uploadError.message });
      setUploading(false);
      e.target.value = '';
      return;
    }
    if (form.avatar_path && form.avatar_path !== path) {
      await supabase.storage.from('avatars').remove([form.avatar_path]);
    }
    const { data: signed } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60 * 24 * 7);
    setForm(f => ({ ...f, avatar_url: signed?.signedUrl || '', avatar_icon: f.avatar_icon, avatar_path: path }));
    setStatus({ type: 'ok', message: 'Imagen cargada. Guarda para aplicar.' });
    setUploading(false);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatus(null);
    const nameTrimmed = form.nombre.trim();
    const [firstName, ...rest] = nameTrimmed.split(/\s+/);
    const apellido = rest.join(' ').trim();
    const { error } = await supabase.auth.updateUser({
      data: {
        nombre: firstName || nameTrimmed,
        apellido: apellido || null,
        full_name: nameTrimmed,
        phone: form.phone,
        avatar_icon: form.avatar_icon,
        avatar_url: form.avatar_url || null,
        avatar_path: form.avatar_path || null,
        bio: form.bio,
        rol: user.user_metadata?.rol || 'cliente'
      }
    });
    if (error) {
      setStatus({ type: 'error', message: error.message });
      setSaving(false);
      return;
    }

    // Persistir también en public.profiles (fuente de verdad para phone/plan en el panel)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: nameTrimmed,
          phone: form.phone || null,
          role: (user.user_metadata?.rol as string | undefined) ?? 'cliente'
        },
        { onConflict: 'id' }
      );
    if (profileError) {
      setStatus({ type: 'error', message: `Guardado parcial: no se pudo actualizar el perfil en la base de datos (${profileError.message}).` });
      setSaving(false);
      return;
    }

    await refreshUser();
    setStatus({ type: 'ok', message: 'Perfil actualizado' });
    setSaving(false);
  };

  const memberSince = user?.created_at ? new Date(user.created_at) : null;

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen text-slate-100">
        <div className="max-w-[98vw] xl:max-w-[1600px] mx-auto px-2 sm:px-6 py-10 space-y-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Cuenta</p>
          <h1 className="text-3xl font-bold text-white">Configuración de la cuenta</h1>
          <p className="text-white/70">Gestiona la información de tu perfil. Los cambios se reflejan en el panel y la barra lateral.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 items-start">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-6 space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white leading-tight">Información del perfil</h2>
              <p className="text-sm text-white/70 mt-1">Completa o actualiza tus datos personales.</p>
            </div>

            <div className="flex flex-col gap-7 w-full max-w-2xl mx-auto">
              <label className="flex flex-col gap-2 text-sm w-full">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <UserRound className="w-4 h-4 text-orange-400" /> Nombre completo
                </span>
                <input
                  className="rounded-lg bg-white/10 border border-white/10 px-5 py-3 text-lg text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400/40 transition w-full"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Escribe tu nombre"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm w-full">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <Mail className="w-4 h-4 text-orange-400" /> Correo electrónico
                </span>
                <input
                  className="rounded-lg bg-white/10 border border-white/10 px-5 py-3 text-lg text-white/70 w-full"
                  value={user?.email || ''}
                  disabled
                />
                <span className="text-[11px] text-white/70">El correo no se puede modificar</span>
              </label>

              <label className="flex flex-col gap-2 text-sm w-full">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <PhoneIcon className="w-4 h-4 text-orange-400" /> Teléfono
                </span>
                <PhoneNumberInput
                  value={form.phone}
                  onChange={(value) => setForm(f => ({ ...f, phone: value }))}
                  defaultCountry="ve"
                  placeholder="Número de teléfono"
                  heightPx={52}
                  fontSizePx={18}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm w-full">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <BadgeCheck className="w-4 h-4 text-orange-400" /> Biografía
                </span>
                <textarea
                  className="rounded-lg bg-white/10 border border-white/10 px-5 py-3 text-lg text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400/40 transition resize-none w-full"
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Cuéntanos algo breve..."
                  rows={3}
                />
              </label>
            </div>

            <div className="flex justify-end mt-10">
              <button
                type="submit"
                disabled={saving || authLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-8 py-3 font-semibold text-white hover:border-orange-400/40 hover:bg-orange-400/10 transition-colors disabled:opacity-60 text-lg shadow-md"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Guardar cambios</span>
              </button>
            </div>

            {status && (
              <div
                className={`rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-green-500/10 text-green-100 border border-green-500/30' : 'bg-red-500/10 text-red-100 border border-red-500/30'}`}
              >
                {status.message}
              </div>
            )}

          </form>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col items-center py-6 px-10 w-full max-w-2xl mx-auto">
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-4 w-full">
                  <UserRound className="text-orange-400" size={18} />
                  <span className="font-semibold text-white text-base">Foto de perfil</span>
                </div>
                <div className="relative flex flex-col items-center w-full">
                  <div className="w-24 h-24 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center overflow-hidden mb-2 relative">
                    {isDefaultAvatar ? (
                      <UserRound size={48} className="text-slate-300" strokeWidth={2.2} />
                    ) : (
                      <img src={avatarPreview} alt="avatar" className="object-cover w-full h-full" />
                    )}
                    {(saving || uploading) && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-orange-400/40 rounded-lg py-3 mt-2 hover:bg-orange-400/10 transition disabled:opacity-60"
                  >
                    <Upload className="w-6 h-6 text-orange-400 mb-1" />
                    <span className="text-orange-300 font-medium">Subir foto</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="text-xs text-white/70 mt-2">JPG, PNG o GIF (máx 2MB)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl shadow-2xl p-4 px-8 w-full max-w-2xl mx-auto">
              <div className="flex items-center mb-2">
                {/* Icono removido */}
                <span className="font-semibold text-white text-base">Resumen del perfil</span>
              </div>
              <div className="space-y-2 text-[15px]">
                <div>
                  <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold mb-1">
                    <UserRound size={16} color="#f97316" />
                    <span>NOMBRE</span>
                  </div>
                  <div className="text-white/90">{form.nombre || '—'}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold mb-1">
                    <Mail size={16} color="#f97316" />
                    <span>CORREO</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <span>{user?.email}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold mb-1">
                    <BadgeCheck size={16} color="#f97316" />
                    <span>ROL</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400">{user?.user_metadata?.rol || 'Cliente'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold mb-1">
                    <CalendarDays size={16} color="#f97316" />
                    <span>MIEMBRO DESDE</span>
                  </div>
                  <div className="text-slate-300">{memberSince ? memberSince.toLocaleDateString('es-VE') : '—'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-400/40 bg-orange-500/90 shadow-2xl p-4 px-8 w-full max-w-2xl mx-auto flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-white">¿Necesitas ayuda?</h3>
              <p className="text-sm text-white/90 mt-2">Si necesitas cambiar tu correo o restablecer tu contraseña, por favor contacta al soporte.</p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </MobileScaleWrapper>
  );
}
