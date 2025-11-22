import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Main/Hero";
import { HowItWorks } from "@/components/Main/HowItWorks";
import { Features } from "@/components/Main/Features";
import { CTA } from "@/components/Main/CTA";

export default function HomePage() {
  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
    </div>
  );
}
