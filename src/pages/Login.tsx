
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingAnimation from '../components/LoadingAnimation';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const passwordInputRef = useRef(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password, remember);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleKeyDown = () => {
    // No custom touched logic
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSent(false);
    setTimeout(() => {
      if (forgotEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
        setForgotSent(true);
        setForgotError('');
      } else {
        setForgotError('Email inválido');
      }
      setForgotLoading(false);
    }, 1200);
  };
  return (
  <div className="relative min-h-screen w-full flex items-start justify-center overflow-hidden pt-16 md:pt-28">
      <div className="w-full max-w-md mx-auto rounded-3xl bg-white/5 border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-lg p-8 md:p-10 flex flex-col items-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <h1 className="text-4xl font-bold text-white mb-2 text-center mt-0">¡Bienvenido de nuevo!</h1>
        <p className="text-base text-white/70 mb-6 text-center">Inicia sesión para continuar y gestionar tu cuenta.</p>
        <form className="w-full space-y-6" onSubmit={handleSubmit} autoComplete="on" onKeyDown={handleKeyDown}>
          <div>
            <label htmlFor="email" className="block text-base font-medium text-white mb-1">Correo electrónico</label>
            <input
              id="email"
              className="w-full rounded-xl border bg-white/5 px-4 py-3 text-base outline-none ring-0 transition-all duration-200 border-white/15 focus:border-orange-400 focus:ring-orange-400"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-base font-medium text-white">Contraseña</label>
              <button
                type="button"
                className="text-sm text-orange-400 hover:underline focus:outline-none"
                onClick={() => setShowForgot(v => !v)}
                aria-expanded={showForgot}
                aria-controls="forgot-panel"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                ref={passwordInputRef}
                className="w-full rounded-xl border bg-white/5 px-4 py-3 text-base outline-none ring-0 pr-12 transition-all duration-200 border-white/15 focus:border-orange-400 focus:ring-orange-400"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                // minLength eliminado, no requerido en login
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-500 focus:outline-none"
                tabIndex={0}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.938 4.675A9.956 9.956 0 012 15c0-5.523 4.477-10 10-10 1.657 0 3.236.336 4.675.938" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="accent-orange-500 w-5 h-5 rounded"
                id="remember"
              />
              <label htmlFor="remember" className="text-white text-base">Recuérdame</label>
            </div>
          </div>
          {/* Panel de recuperación */}
          {showForgot && (
            <div
              id="forgot-panel"
              className="transition-all duration-300 overflow-hidden max-h-40 opacity-100 mb-2"
              aria-hidden={!showForgot}
            >
              <form className="flex flex-col gap-2 mt-2" onSubmit={handleForgot}>
                <input
                  type="email"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-base outline-none ring-0 focus:border-orange-400"
                  placeholder="Tu correo para recuperar"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-label="Correo para recuperar"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 transition disabled:opacity-60"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? <LoadingAnimation size="sm" variant="dots" text="Enviando..." /> : 'Enviar recuperación'}
                </button>
                {forgotError && <span className="text-red-400 text-sm">{forgotError}</span>}
                {forgotSent && <span className="text-green-400 text-sm">¡Correo enviado! Revisa tu bandeja.</span>}
              </form>
            </div>
          )}
          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-white text-black font-semibold py-3 text-center transition disabled:opacity-60 shadow-lg hover:bg-orange-600 hover:text-white"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <LoadingAnimation size="sm" variant="dots" text="Ingresando..." /> : 'Iniciar sesión'}
          </button>
          {error && <span className="text-red-400 text-sm text-center block animate-fade-in mt-2">{error}</span>}
        </form>
        <div className="my-6 border-t border-white/10 w-full" />
        <p className="text-center text-white/70 text-sm">
          ¿No tienes una cuenta?{' '}
          <button
            type="button"
            className="text-orange-400 font-semibold hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
            onClick={() => navigate('/onboarding')}
          >
            Crear cuenta gratis
          </button>
        </p>
      </div>
    </div>
  );
}

