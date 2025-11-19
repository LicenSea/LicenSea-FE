import { motion } from "framer-motion";
import { Sparkles, Layers, Coins } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Create",
    description: "Mint your dataset or artwork as a License NFT.",
    number: "01",
  },
  {
    icon: Layers,
    title: "Expand",
    description: "Allow others to create derivative works linked on-chain.",
    number: "02",
  },
  {
    icon: Coins,
    title: "Earn",
    description:
      "Track and claim royalties transparently through smart contracts.",
    number: "03",
  },
];

export function HowItWorks() {
  return (
    <section className="flex min-h-screen relative py-32 overflow-hidden bg-[#c4affb]">
      {/* Decorative Elements */}
      {/* <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#a3f9d8]/20 rounded-full blur-3xl" /> */}
      {/* <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#e6fc73]/20 rounded-full blur-3xl" /> */}

      <div className="flex flex-col justify-center relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-galmuri text-5xl md:text-6xl mb-6 bg-gradient-to-r from-[#262d5c] via-[#262d5c] to-[#e6fc73] bg-clip-text text-transparent">
            How It Works
          </h2>
        </motion.div>

        {/* 3-Card Horizontal Layout */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              {/* Card */}
              {/* <div className="h-full p-8 rounded-sm bg-gradient-to-br from-[#f0e8e5]/80 to-[#f0e8e5]/40 backdrop-blur-sm border border-gray-300 hover:border-[#a3f9d8]/50 transition-all duration-300"> */}
              <div className="h-full p-8 rounded-sm bg-white/10 backdrop-blur-sm border border-gray-300 hover:border-[#a3f9d8] transition-all duration-300">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#a3f9d8] to-[#e6fc73] flex items-center justify-center shadow-lg shadow-[#e6fc73]/50">
                  <span className="text-[#262d5c] font-bold">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#a3f9d8]/40 to-[#e6fc73]/40">
                  <step.icon className="w-8 h-8 text-[#262d5c]" />
                </div>

                {/* Content */}
                <h3 className="text-3xl mb-4 text-[#262d5c] font-semibold">
                  {step.title}
                </h3>
                <p className="text-[#262d5c]/80 leading-relaxed">
                  {step.description}
                </p>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#a3f9d8]/0 to-[#e6fc73]/0 group-hover:from-[#a3f9d8]/10 group-hover:to-[#e6fc73]/10 transition-all duration-300 -z-10" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Data Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-lg bg-gradient-to-r from-[#a3f9d8]/40 to-[#e6fc73]/40 backdrop-blur-md border border-[#262d5c]/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#a3f9d8] animate-pulse" />
              <span className="text-[#262d5c]/80">Royalties earned:</span>
              <span className="text-[#262d5c] font-semibold">2.34 SUI</span>
            </div>
            <div className="w-px h-6 bg-[#262d5c]/30" />
            <div className="flex items-center gap-2">
              <span className="text-[#262d5c]/80">Derivatives created:</span>
              <span className="text-[#262d5c] font-semibold">42</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
