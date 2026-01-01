
import React, { useState } from 'react';
// ...existing code...
import { useAuth } from '../context/useAuth';
import Stepper, { Step } from '../components/Stepper';
import { useNavigate } from 'react-router-dom';
// Enlace reutilizable para volver al login
const LoginLink = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="text-orange-400 font-semibold hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
      onClick={() => navigate('/login')}
    >
      Iniciar sesión
    </button>
  );
};

export default function Onboarding() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  // const [registerSuccess, setRegisterSuccess] = useState(false);

  const { register, loading } = useAuth();
  // const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<{nombre?: string; apellido?: string; email?: string; password?: string}>({});

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'nombre':
        return value.trim() ? '' : 'Debes completar este campo para avanzar.';
      case 'apellido':
        return value.trim() ? '' : 'Debes completar este campo para avanzar.';
      case 'email':
        return value.trim() && /^\S+@\S+\.\S+$/.test(value) ? '' : 'Ingresa un email válido para avanzar.';
      case 'password':
        return value.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres para avanzar.';
      default:
        return '';
    }
  };

  const handleChange = (field: string, value: string) => {
    // Update value
    switch (field) {
      case 'nombre': setNombre(value); break;
      case 'apellido': setApellido(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      default: break;
    }
    // Remove error if valid
    setErrors(prev => {
      const newErr = { ...prev };
      const errMsg = validateField(field, value);
      if (!errMsg) delete newErr[field as keyof typeof newErr];
      return newErr;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    const newErrors: typeof errors = {};
    if (!nombre.trim()) {
      newErrors.nombre = 'Debes completar este campo para avanzar.';
    }
    if (!apellido.trim()) {
      newErrors.apellido = 'Debes completar este campo para avanzar.';
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Ingresa un email válido para avanzar.';
    }
    if (!password || password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres para avanzar.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2); // Solo pasar al paso de revisión de datos
    }
  };

  // Confirmar datos y registrar en Supabase
  const handleConfirmDatos = async () => {
    setRegisterError(null);
    const result = await register(email, password, { nombre, apellido });
    if (result.success) {
      setStep(3);
    } else {
      setRegisterError(result.error || 'Error al registrar');
    }
  };

  // Validación para cada paso
  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      // Validar todos los campos del primer paso
      return Boolean(nombre.trim()) &&
        Boolean(apellido.trim()) &&
        Boolean(email.trim()) &&
        /^\S+@\S+\.\S+$/.test(email) &&
        password.length >= 8;
    }
    if (currentStep === 2) {
      // No permitir avanzar manualmente al paso 3
      return false;
    }
    return true;
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 md:mt-24 rounded-3xl bg-white/5 border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-lg py-4 md:py-6 px-4 md:px-8 flex flex-col items-center !pb-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <Stepper
        initialStep={step}
        onStepChange={setStep}
        className="w-full"
        stepCircleContainerClassName="step-card-container"
        stepContainerClassName="step-inline-row"
        contentClassName="step-inline-content"
        footerClassName="step-inline-footer"
        validateStep={validateStep}
      >
        <Step>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2 text-lg text-white/80">
              <h3 className="text-2xl font-bold text-orange-400">Datos básicos</h3>
              <p className="text-base">Completa tu nombre y correo para empezar el registro.</p>
            </div>
            <div className="space-y-7">
              {/* Grupo de nombre y apellido */}
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex-1 space-y-1 text-base text-white/80">
                  <span className="font-semibold">Nombre</span>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-base outline-none ring-0 focus:border-orange-400 focus:ring-orange-400 transition"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                  />
                  {errors.nombre && (
                    <span className="text-red-400 text-xs mt-1 block animate-fade-in">
                      {errors.nombre}
                    </span>
                  )}
                </label>
                <label className="flex-1 space-y-1 text-base text-white/80">
                  <span className="font-semibold">Apellido</span>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-base outline-none ring-0 focus:border-orange-400 focus:ring-orange-400 transition"
                    placeholder="Apellido"
                    value={apellido}
                    onChange={e => handleChange('apellido', e.target.value)}
                  />
                  {errors.apellido && (
                    <span className="text-red-400 text-xs mt-1 block animate-fade-in">
                      {errors.apellido}
                    </span>
                  )}
                </label>
              </div>
              {/* Email */}
              <label className="space-y-1 text-base text-white/80 w-full">
                <span className="font-semibold">Email</span>
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-base outline-none ring-0 focus:border-orange-400 focus:ring-orange-400 transition"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => handleChange('email', e.target.value)}
                />
                {errors.email && (
                  <span className="text-red-400 text-xs mt-1 block animate-fade-in">
                    {errors.email}
                  </span>
                )}
              </label>
              {/* Contraseña */}
              <label className="space-y-1 text-base text-white/80 w-full">
                <span className="font-semibold">Contraseña</span>
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-base outline-none ring-0 pr-12 focus:border-orange-400 focus:ring-orange-400 transition"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña (mín. 8 caracteres)"
                    value={password}
                    onChange={e => handleChange('password', e.target.value)}
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
                {errors.password && (
                  <span className="text-red-400 text-xs mt-1 block animate-fade-in">
                    {errors.password}
                  </span>
                )}
              </label>
              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-white text-black font-semibold py-3 text-center transition disabled:opacity-60 shadow-lg hover:bg-orange-600 hover:text-white"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'Registrando...' : 'Registrarme'}
              </button>
              <div className="h-0" />
              {registerError && (
                <span className="text-red-400 text-xs mt-2 block animate-fade-in">
                  {registerError}
                </span>
              )}
            </div>
          </form>
          <div className="my-6 border-t border-white/10 w-full" />
          {step !== 3 && (
            <p className="text-center text-white/70 text-sm mb-4">
              ¿Ya tienes una cuenta?{' '}
              <LoginLink />
            </p>
          )}
              {step === 3 && (
                <div className="w-full mt-4 border-t border-white/10" />
              )}
              {step === 3 && (
                <p className="text-center text-white/70 text-sm mt-4 mb-1">
                  ¿Ya aprobaron tu cuenta?{' '}
                  <button
                    type="button"
                    className="text-orange-400 font-semibold hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
                    onClick={() => navigate('/login')}
                  >
                    Iniciar sesión
                  </button>
                </p>
              )}
        </Step>
        <Step>
          <div className="flex flex-col items-center justify-center min-h-[320px] w-full">
            <div className="w-full max-w-sm bg-gradient-to-br from-white/5 to-black/60 border border-white/10 rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-orange-400 mb-2 text-center">Revisión de datos</h3>
              <p className="text-white/80 text-center mb-6">Revisa que tus datos sean correctos antes de confirmar tu registro.</p>
              <div className="divide-y divide-white/10">
                <div className="py-3 flex items-center gap-2">
                  <span className="block w-24 text-white/60 font-medium">Nombre</span>
                  <span className="text-white text-base font-semibold">{nombre}</span>
                </div>
                <div className="py-3 flex items-center gap-2">
                  <span className="block w-24 text-white/60 font-medium">Apellido</span>
                  <span className="text-white text-base font-semibold">{apellido}</span>
                </div>
                <div className="py-3 flex items-center gap-2">
                  <span className="block w-24 text-white/60 font-medium">Email</span>
                  <span className="text-white text-base font-semibold break-all">{email}</span>
                </div>
              </div>
              {/* Los botones se moverán fuera de la tarjeta */}
            </div>
          </div>
          {/* Botones fuera de la tarjeta, centrados */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center items-center w-full">
            <button
              className="flex-1 px-4 py-2 rounded-xl bg-white text-black font-semibold shadow transition max-w-xs hover:bg-neutral-100"
              onClick={() => setStep(1)}
              type="button"
            >
              Modificar datos
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-xl bg-white text-black font-semibold shadow-lg transition max-w-xs hover:bg-orange-600 hover:text-white"
              onClick={handleConfirmDatos}
              type="button"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Registrando...' : 'Confirmar datos'}
            </button>
          </div>
        </Step>
        <Step>
          <div className="flex flex-col items-center justify-center min-h-[260px] w-full">
            <div className="w-full max-w-sm bg-gradient-to-br from-white/5 to-black/60 border border-white/10 rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-orange-400 mb-2 text-center">¡Registro exitoso!</h3>
              <p className="text-white/80 text-base mb-6 text-left">
                Tu cuenta ha sido registrada correctamente. Ahora debes esperar a que un administrador la acepte.
              </p>
              <div className="flex items-start gap-2 bg-white/5 rounded-lg p-3 w-full mb-2">
                <svg className="flex-shrink-0 mt-1 text-orange-400" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z"/></svg>
                <span className="text-white/80 text-sm leading-relaxed">
                  Si deseas agilizar el proceso, puedes contactar directamente al negocio para avisar que estás esperando la confirmación de tu cuenta.
                </span>
              </div>
              <div className="w-full mt-4 border-t border-white/10" />
              <p className="text-center text-white/70 text-sm mt-4 mb-1">
                ¿Ya aprobaron tu cuenta?{' '}
                <button
                  type="button"
                  className="text-orange-400 font-semibold hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}
