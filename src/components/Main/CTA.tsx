import { motion } from "framer-motion";
import { Button } from "../ui/button";
// import { ArrowRight, Sparkles } from "lucide-react";
// import { ImageWithFallback } from "./figma/ImageWithFallback";

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#c4affb]" />

      {/* Soft Wave Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="wave-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q 25 30, 50 50 T 100 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-[#a3f9d8]"
              />
              <path
                d="M0 60 Q 25 40, 50 60 T 100 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-[#e6fc73]"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave-pattern)" />
        </svg>
      </div>

      {/* Animated Glow Elements */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a3f9d8]/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-galmuri text-5xl md:text-6xl mb-12 text-[#262d5c]"
        >
          Your creation is the origin of{" "}
          <span className="bg-gradient-to-r from-[#a3f9d8] to-[#e6fc73] bg-clip-text text-transparent">
            endless possibilities.
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            className="border bg-gradient-to-r from-[#a3f9d8] to-[#e6fc73] hover:from-[#a3f9d8]/50 hover:to-[#e6fc73]/50 text-[#262d5c]"
          >
            Mint Your License NFT
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
