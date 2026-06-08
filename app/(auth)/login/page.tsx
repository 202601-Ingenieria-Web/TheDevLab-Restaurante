'use client';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado izquierdo - formulario */}
      <div className="flex flex-col items-center justify-center p-10 bg-white">
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-stone-800 tracking-tight">
              TheDevLab
            </h1>
            <p className="text-stone-400 text-sm tracking-widest uppercase">
              Restaurante & Gestión
            </p>
            <div className="w-12 h-0.5 bg-amber-500 mt-3" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-stone-700">Iniciar sesión</h2>
            <p className="text-stone-400 text-sm">Ingresa tus credenciales para continuar</p>
          </div>
          <LoginForm />
        </div>
      </div>

      {/* Lado derecho - foto restaurante */}
      <div className="hidden lg:flex flex-col justify-end relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80')`,
          }}
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Contenido */}
        <div className="relative z-10 p-16 space-y-6">
          <div className="w-8 h-0.5 bg-amber-400" />
          <h2 className="text-5xl font-serif text-white leading-tight">
            El arte de <br />
            <span className="text-amber-400 italic">la buena mesa</span>
          </h2>
          <p className="text-stone-300 text-base max-w-sm leading-relaxed font-light">
            Donde cada ingrediente cuenta y el servicio importa.
          </p>
          <div className="pt-4 border-t border-stone-700 space-y-3">
            <p className="text-stone-500 text-xs uppercase tracking-widest"></p>
            <div className="space-y-2">
              <div className="flex justify-between text-stone-300 text-sm">
                <span></span>
                <span className="text-amber-400">·····</span>
              </div>
              <div className="flex justify-between text-stone-300 text-sm">
                <span></span>
                <span className="text-amber-400">·····</span>
              </div>
              <div className="flex justify-between text-stone-300 text-sm">
                <span></span>
                <span className="text-amber-400">·····</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}