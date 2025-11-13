import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { AnimatedLogo } from "./AnimatedLogo.tsx";
import InfiniteExpansion from "./InfiniteExpansion.tsx";
import { useNavigate } from "react-router";

export function Hero() {
  const nav = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute" />

      {/* Animated Gradient Waves */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a3f9d8]/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e6fc73]/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#a3f9d8]/20 to-[#e6fc73]/20 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        {/* Animated Logo */}
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex justify-center mb-12"
        >
          <AnimatedLogo />
        </motion.div> */}
        {/* <InfiniteExpansion /> */}

        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-galmuri text-5xl md:text-7xl mb-6 bg-gradient-to-r from-[#a3f9d8] to-[#e6fc73] bg-clip-text text-transparent"
        >
          A Sea of <span className="font-semibold">Infinite Creation</span> and{" "}
          <span className="font-semibold">Fair Royalties</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-[#262d5c]/80 mb-12 max-w-3xl mx-auto"
        >
          LicenSea empowers creators to license, expand, and earn — forever.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            variant="outline"
            className="bg-gradient-to-r from-[#a3f9d8] to-[#e6fc73] hover:from-[#a3f9d8]/50 hover:to-[#e6fc73]/50 text-[#262d5c]"
            onClick={() => nav("/upload")}
          >
            Explore Your Marketplace
          </Button>
        </motion.div>
      </div>

      {/* Bottom Wave Effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-24 text-[#c4affb]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C300,80 900,80 1200,0 L1200,120 L0,120 Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </div>
    </section>
  );
}
