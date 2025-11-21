import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Check, Menu, X } from "lucide-react";

import logo from "@/assets/logo.png";
import { Checkbox } from "../ui/checkbox";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "MARKETPLACE", href: "/marketplace" },
    { name: "UPLOAD", href: "/upload" },
    { name: "DASHBOARD", href: "/dashboard" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-gray-300">
      <div className="mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex gap-8 items-center justify-center">
            {/* Logo */}
            <a href="/">
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  className="border border-[#262d5c] rounded-xs w-8 h-8"
                />
                <span className="font-galmuri text-2xl text-[#262d5c]">
                  LicenSea
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="py-2 px-4 hidden md:flex items-center gap-8 bg-black rounded-[4px]">
              {navLinks.map((link) => {
                const isActive = window.location.pathname === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`group justify-center items-center ${
                      isActive ? "text-[#a3f9d8]" : "text-white"
                    } hover:text-[#a3f9d8] transition-colors flex gap-2`}
                  >
                    <div
                      className={`flex justify-center items-center border rounded-xs w-4 h-4 ${
                        isActive ? "border-[#a3f9d8]" : "border-white"
                      } group-hover:border-[#a3f9d8] transition-colors`}
                    >
                      {isActive && <Check className="w-4 h-4 text-[#a3f9d8]" />}
                    </div>
                    {link.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* TODO: zkLogin */}
            <ConnectButton />
            {/* <Button className="bg-gradient-to-r from-[#a3f9d8] to-[#e6fc73] hover:from-[#a3f9d8] hover:to-[#f0e8e5] text-[#262d5c] border-0">
              Launch App
            </Button> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#262d5c]/80 hover:text-[#262d5c] transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#262d5c]/30 bg-[#c4affb]/95 backdrop-blur-md"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-[#262d5c]/80 hover:text-[#a3f9d8] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 space-y-3 border-t border-[#262d5c]/30">
                <Button
                  variant="outline"
                  className="w-full border-[#262d5c]/30 text-[#262d5c]"
                >
                  Sign In
                </Button>
                <Button className="w-full bg-gradient-to-r from-[#a3f9d8] to-[#e6fc73] text-[#262d5c] border-0">
                  Launch App
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
