"use client";

import { motion } from "framer-motion";
import { Lock, Infinity, Lightbulb, Globe } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Trustless Royalties",
    description: "Royalties are distributed on-chain with full transparency.",
    emoji: "🔒",
  },
  {
    icon: Infinity,
    title: "Infinite Derivation",
    description: "Each new work inherits and rewards its origin.",
    emoji: "♾️",
  },
  {
    icon: Lightbulb,
    title: "Creator First",
    description: "Original authors always retain their rightful value.",
    emoji: "💡",
  },
  {
    icon: Globe,
    title: "Open Ecosystem",
    description: "Anyone can build upon existing creativity.",
    emoji: "🌐",
  },
];

export function Features() {
  return (
    <section className="relative flex py-32 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-galmuri text-5xl md:text-6xl mb-6 bg-gradient-to-r from-[#262d5c] via-[#262d5c] to-[#e6fc73] bg-clip-text text-transparent">
            Why LicenSea?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-300">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Glassmorphism Card */}
              <div className="h-full p-8 transition-all duration-300 hover:bg-[#a3f9d8]">
                {/* Emoji Icon */}
                <div className="bg-white rounded-[4px] w-fit text-4xl mb-4 p-2 transition-transform duration-300">
                  {feature.emoji}
                </div>

                {/* Content */}
                <h3 className="text-2xl mb-4 text-[#262d5c] font-semibold">
                  {feature.title}
                </h3>
                <p className="text-[#262d5c]/80 leading-relaxed">
                  {feature.description}
                </p>

                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#a3f9d8]/0 to-[#e6fc73]/0 group-hover:from-[#a3f9d8]/10 group-hover:to-[#e6fc73]/10 transition-all duration-300 -z-10" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
