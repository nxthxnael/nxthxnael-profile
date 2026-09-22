"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const roles = ["Developer", "Designer", "Entrepreneur"];

export function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.12 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative overflow-hidden bg-grid bg-glow px-6 py-28 sm:py-36">
      <motion.div
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.span
          variants={item}
          className="rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-muted-foreground"
        >
          Hi, I&apos;m nxthxnael
        </motion.span>

        <motion.h1
          variants={item}
          className="text-glow-gradient text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          I build products, design experiences,
          <br className="hidden sm:block" /> and ship businesses.
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          {roles.join(" · ")} — I take ideas from a blank canvas to something
          people actually use.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-2 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/work"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            View my work
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Get in touch
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
