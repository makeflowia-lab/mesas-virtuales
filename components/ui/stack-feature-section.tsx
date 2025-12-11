"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Cloud,
  Server,
  Database,
  Smartphone,
  CreditCard,
  Wifi,
  BarChart3,
  Globe2,
  Users,
  ShoppingBag,
  Star,
  ShieldCheck,
  ReceiptText,
  Layers3,
} from "lucide-react";

const iconConfigs = [
  { Icon: Cloud, color: "#38bdf8" },
  { Icon: Server, color: "#f97316" },
  { Icon: Database, color: "#22c55e" },
  { Icon: Smartphone, color: "#a855f7" },
  { Icon: CreditCard, color: "#0ea5e9" },
  { Icon: Wifi, color: "#eab308" },
  { Icon: BarChart3, color: "#f97316" },
  { Icon: Globe2, color: "#22c55e" },
  { Icon: Users, color: "#3b82f6" },
  { Icon: ShoppingBag, color: "#ec4899" },
  { Icon: Star, color: "#eab308" },
  { Icon: ShieldCheck, color: "#22c55e" },
  { Icon: ReceiptText, color: "#6366f1" },
  { Icon: Layers3, color: "#0ea5e9" },
];

export default function StackFeatureSection() {
  const orbitCount = 3;
  const orbitGap = 8; // rem between orbits
  const iconsPerOrbit = Math.ceil(iconConfigs.length / orbitCount);

  return (
    <section className="relative max-w-6xl mx-auto my-32 pl-10 flex flex-col md:flex-row items-center justify-between h-auto md:h-[30rem] border border-gray-200 dark:border-gray-700 bg-white dark:bg-black overflow-hidden rounded-3xl shadow-2xl">
      {/* Left side: Heading and Text */}
      <div className="w-full md:w-1/2 z-10 p-8 md:p-0">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          Construye tu idea
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-lg text-lg">
          Mesas Virtuales te ofrece las mejores herramientas tecnológicas para gestionar tu negocio. Rápido, moderno y escalable.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-md bg-botanero-primary px-8 text-sm font-medium text-white transition-colors hover:bg-botanero-warm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
             Empezar Ahora
          </Link>
          <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Saber más
          </button>
        </div>
      </div>

      {/* Right side: Orbit animation cropped to 1/4 */}
      <div className="relative w-full md:w-1/2 h-96 md:h-full flex items-center justify-center md:justify-start overflow-hidden mt-8 md:mt-0">
        <div className="relative w-[40rem] h-[40rem] md:w-[50rem] md:h-[50rem] md:translate-x-[20%] flex items-center justify-center">
          {/* Center Circle */}
          <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 shadow-lg flex items-center justify-center z-20 relative">
            <span className="text-4xl">🍺</span>
          </div>

          {/* Generate Orbits */}
          {[...Array(orbitCount)].map((_, orbitIdx) => {
            const size = `${12 + orbitGap * (orbitIdx + 1)}rem`;
            const angleStep = (2 * Math.PI) / iconsPerOrbit;

            return (
              <div
                key={orbitIdx}
                className="absolute rounded-full border border-dashed border-gray-300 dark:border-gray-700"
                style={{
                  width: size,
                  height: size,
                  animation: `spin ${20 + orbitIdx * 10}s linear infinite`,
                }}
              >
                {iconConfigs
                  .slice(orbitIdx * iconsPerOrbit, orbitIdx * iconsPerOrbit + iconsPerOrbit)
                  .map((cfg, iconIdx) => {
                    const angle = iconIdx * angleStep;
                    const x = 50 + 50 * Math.cos(angle);
                    const y = 50 + 50 * Math.sin(angle);

                    return (
                      <div
                        key={iconIdx}
                        className="absolute bg-white dark:bg-gray-800 rounded-full p-2 shadow-md flex items-center justify-center"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                          width: '3rem',
                          height: '3rem'
                        }}
                      >
                        <cfg.Icon className="w-6 h-6" style={{ color: cfg.color }} />
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}

