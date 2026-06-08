import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <div className="relative min-h-screen flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-black/65" />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-12 py-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">TheDevLab</h1>
            <p className="text-amber-400 text-xs tracking-widest uppercase">Restaurante</p>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6">
          <p className="text-amber-400 text-xs uppercase tracking-widest mb-4">Bienvenido a</p>
          <h2 className="text-7xl font-serif font-bold text-white leading-tight mb-6">
            TheDevLab
          </h2>
          <div className="w-16 h-0.5 bg-amber-400 mb-6" />
          <p className="text-stone-300 text-xl max-w-lg leading-relaxed font-light mb-10">
            Una experiencia gastronómica única. Cocina con pasión, servicio con dedicación.
          </p>
          <Link
            href="/login"
            className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-10 py-4 text-sm tracking-widest uppercase transition-colors duration-200"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Contacto */}
        <div className="relative z-10 flex justify-center gap-16 px-12 py-10 border-t border-white/10">
          <div className="text-center">
            <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Dirección</p>
            <p className="text-white text-sm">Medellín</p>
          </div>
          <div className="text-center">
            <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Teléfono</p>
            <p className="text-white text-sm">+57 604 123 4567</p>
          </div>
          <div className="text-center">
            <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Correo</p>
            <p className="text-white text-sm">contacto@thedevlab.co</p>
          </div>
          <div className="text-center">
            <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Horario</p>
            <p className="text-white text-sm">Lun — Dom, 11am — 10pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}