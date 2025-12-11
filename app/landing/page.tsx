"use client";

import { TextParallaxContentExample } from "@/components/ui/text-parallax-content-scroll";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import StackFeatureSection from "@/components/ui/stack-feature-section";
import { Dock } from "@/components/ui/dock-two";
import { Home, Search, Calendar, Settings, User, LogIn } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const dockItems = [
    { icon: Home, label: "Inicio", onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { icon: Search, label: "Características", onClick: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: User, label: "Testimonios", onClick: () => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: LogIn, label: "Login", onClick: () => router.push('/login') },
  ];

  const testimonials = [
    {
      quote: "Desde que usamos Mesas Virtuales, la rotación de mesas ha mejorado un 30%. ¡Es increíble!",
      name: "Carlos Ruiz",
      designation: "Dueño de 'El Tizón'",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3560&auto=format&fit=crop"
    },
    {
      quote: "La facilidad para gestionar el menú y los pedidos es lo que necesitábamos. Mis meseros están felices.",
      name: "Ana López",
      designation: "Gerente, Café Central",
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=3560&auto=format&fit=crop"
    },
    {
      quote: "El soporte es excelente y la plataforma nunca falla. Recomendado 100%.",
      name: "Javier Méndez",
      designation: "CEO, Grupo Gastronómico",
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3560&auto=format&fit=crop"
    }
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black relative pb-32">
      {/* Header flotante */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍺</span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-600">
                Mesas Virtuales
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section con Parallax */}
      <section className="pt-16">
        <TextParallaxContentExample />
      </section>

      {/* Características (Stack) */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <StackFeatureSection />
        </div>
      </section>

      {/* Testimonios Animados */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Lo que dicen nuestros clientes
          </h2>
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-gray-400">© 2025 Mesas Virtuales. makeflowia@gmail.com derechos reservados.</p>
        </div>
      </footer>

      {/* Dock Flotante */}
      <Dock items={dockItems} />
    </main>
  );
}
