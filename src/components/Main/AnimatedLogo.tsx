import { motion } from "framer-motion";

export function AnimatedLogo() {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#a3f9d8] to-[#e6fc73] opacity-30 blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Infinity symbol made of wave paths */}
      <svg
        className="relative w-full h-full"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left wave loop */}
        <motion.path
          d="M 60 100 Q 40 60, 60 40 Q 80 60, 60 100 Q 40 140, 60 160 Q 80 140, 60 100"
          stroke="url(#gradient1)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            opacity: { duration: 0.5 },
          }}
        />

        {/* Right wave loop */}
        <motion.path
          d="M 140 100 Q 160 60, 140 40 Q 120 60, 140 100 Q 160 140, 140 160 Q 120 140, 140 100"
          stroke="url(#gradient2)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2, delay: 0.3, ease: "easeInOut" },
            opacity: { duration: 0.5, delay: 0.3 },
          }}
        />

        {/* Connecting wave */}
        <motion.path
          d="M 60 100 Q 100 80, 140 100"
          stroke="url(#gradient3)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.5, delay: 0.6, ease: "easeInOut" },
            opacity: { duration: 0.5, delay: 0.6 },
          }}
        />

        {/* Animated particles along the path */}
        <motion.circle
          r="3"
          fill="#a3f9d8"
          animate={{
            offsetDistance: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M 60 100 Q 40 60, 60 40 Q 80 60, 60 100 Q 40 140, 60 160 Q 80 140, 60 100"
          />
        </motion.circle>

        <motion.circle
          r="3"
          fill="#e6fc73"
          animate={{
            offsetDistance: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M 140 100 Q 160 60, 140 40 Q 120 60, 140 100 Q 160 140, 140 160 Q 120 140, 140 100"
          />
        </motion.circle>

        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3f9d8" />
            <stop offset="100%" stopColor="#e6fc73" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6fc73" />
            <stop offset="100%" stopColor="#f0e8e5" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a3f9d8" />
            <stop offset="50%" stopColor="#e6fc73" />
            <stop offset="100%" stopColor="#f0e8e5" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#262d5c] opacity-60 blur-md"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
