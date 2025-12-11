'use client'

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const TextParallaxContentExample = () => {
  return (
    <div className="bg-white">
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2574&auto=format&fit=crop"
        subheading="Experiencia"
        heading="El mejor ambiente."
      >
        <ExampleContent 
          title="Disfruta con amigos"
          description="Nuestro botanero ofrece el ambiente perfecto para relajarte después del trabajo o celebrar ocasiones especiales. Música, comida y la mejor compañía."
        />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2670&auto=format&fit=crop"
        subheading="Calidad"
        heading="Sabor auténtico."
      >
        <ExampleContent 
          title="Ingredientes frescos"
          description="Preparamos cada botana al momento con ingredientes seleccionados. Desde nuestros famosos nachos hasta las alitas más picantes, todo es calidad."
        />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1535958636474-b021ee8876a3?q=80&w=2670&auto=format&fit=crop"
        subheading="Variedad"
        heading="Cervezas bien frías."
      >
        <ExampleContent 
          title="Carta de bebidas"
          description="Tenemos la selección más completa de cervezas nacionales e importadas, siempre a la temperatura perfecta. ¡Salud!"
        />
      </TextParallaxContent>
    </div>
  );
};

const IMG_PADDING = 12;

interface TextParallaxContentProps {
  imgUrl: string;
  subheading: string;
  heading: string;
  children: React.ReactNode;
}

const TextParallaxContent = ({ imgUrl, subheading, heading, children }: TextParallaxContentProps) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }: { imgUrl: string }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }: { subheading: string; heading: string }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl font-medium">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

const ExampleContent = ({ title, description }: { title: string, description: string }) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12 bg-white">
    <h2 className="col-span-1 text-3xl font-bold md:col-span-4 text-neutral-900">
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
        {description}
      </p>
      <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
        Ven a visitarnos y vive la experiencia completa. Te esperamos con los brazos abiertos.
      </p>
      <button className="w-full rounded bg-botanero-primary px-9 py-4 text-xl text-white transition-colors hover:bg-botanero-warm md:w-fit flex items-center justify-center gap-2">
        Ver Menú <ArrowUpRight className="inline" />
      </button>
    </div>
  </div>
);



