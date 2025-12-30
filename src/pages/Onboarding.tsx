
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stepper, { Step } from '../components/Stepper';
// Enlace reutilizable para volver al login
function LoginLink() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="text-orange-400 font-semibold hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
      onClick={() => navigate('/')}
    >
      Iniciar sesión
    </button>
  );
}

export default function Onboarding() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    const newErrors: typeof errors = {};
    if (!nombre.trim()) newErrors.nombre = 'Debes completar este campo para avanzar.';
    if (!apellido.trim()) newErrors.apellido = 'Debes completar este campo para avanzar.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Ingresa un email válido para avanzar.';
    if (!password || password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres para avanzar.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep((prev) => prev + 1);
    }
  };

  // Validación para cada paso
  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      // Validar todos los campos del primer paso
      return (
        Boolean(nombre.trim()) &&
        Boolean(apellido.trim()) &&
        Boolean(email.trim()) &&
        /^\S+@\S+\.\S+$/.test(email) &&
        password.length >= 8
      );
    }
    // Para otros pasos, permitir avanzar (puedes personalizar)
    return true;
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-black/80 border border-white/15 shadow-2xl backdrop-blur-lg py-4 md:py-6 px-4 md:px-8 flex flex-col items-center">
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
              <h3 className="text-lg font-semibold text-white">Datos básicos</h3>
              <p>Completa tu nombre y correo para empezar el registro.</p>
            </div>
            <div className="space-y-5">
              <div className="grid">
                <label className="space-y-1 text-lg text-white/80">
                  <span>Nombre</span>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                  />
                    {errors.nombre ? (
                      <span className="text-red-400 text-xs mt-1 block animate-fade-in">{errors.nombre}</span>
                    ) : null}
                </label>
                <label className="space-y-1 text-lg text-white/80">
                  <span>Apellido</span>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                    placeholder="Apellido"
                    value={apellido}
                    onChange={e => handleChange('apellido', e.target.value)}
                  />
                    {errors.apellido && (
                      <span className="text-red-400 text-xs mt-1 block animate-fade-in">{errors.apellido}</span>
                    )}
                </label>
              </div>
              <label className="space-y-1 text-lg text-white/80">
                <span>Email</span>
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => handleChange('email', e.target.value)}
                />
                {errors.email && (
                  <span className="text-red-400 text-xs mt-1 block animate-fade-in">{errors.email}</span>
                )}
              </label>
              <label className="space-y-1 text-lg text-white/80">
                <span>Contraseña</span>
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => handleChange('password', e.target.value)}
                />
                {errors.password && (
                  <span className="text-red-400 text-xs mt-1 block animate-fade-in">{errors.password}</span>
                )}
              </label>
              <button
                type="submit"
                className="block w-full mt-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 text-center transition"
              >
                Registrarme
              </button>
            </div>
          </form>
          <div className="my-6 border-t border-white/10 w-full" />
          <p className="text-center text-white/70 text-sm">
            ¿Ya tienes una cuenta?{' '}
            <LoginLink />
          </p>
        </Step>
        <Step>
          <div className="space-y-3 text-lg text-white/80">
            <h3 className="text-lg font-semibold text-white">Verificación</h3>
            <p>Validaremos tu identidad y enviaremos un código de seguridad a tu correo para confirmar el registro.</p>
          </div>
        </Step>
        <Step>
          <div className="space-y-3 text-lg text-white/80">
            <h3 className="text-lg font-semibold text-white">Preferencias</h3>
            <p>Configura notificaciones y preferencias de contacto para recibir alertas y recordatorios.</p>
          </div>
        </Step>
        <Step>
          <div className="space-y-3 text-lg text-white/80">
            <h3 className="text-lg font-semibold text-white">Confirmación</h3>
            <p>Revisa tu información y confirma para finalizar.</p>
          </div>
        </Step>

      </Stepper>
    </div>
  );
}
