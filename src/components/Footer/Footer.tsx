import { Waves, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#c4affb] border-t border-[#262d5c]/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-[#262d5c]" />
            <span className="text-xl text-[#262d5c]">LicenSea</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="#"
              className="text-[#262d5c]/70 hover:text-[#a3f9d8] transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-[#262d5c]/70 hover:text-[#a3f9d8] transition-colors"
            >
              Docs
            </a>
            <a
              href="#"
              className="text-[#262d5c]/70 hover:text-[#a3f9d8] transition-colors"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-[#262d5c]/70 hover:text-[#a3f9d8] transition-colors"
            >
              Twitter
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex gap-3">
            <a
              href="#"
              className="w-9 h-9 rounded-lg bg-[#f0e8e5]/50 hover:bg-[#f0e8e5]/70 border border-[#262d5c]/30 flex items-center justify-center text-[#262d5c]/70 hover:text-[#a3f9d8] transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-lg bg-[#f0e8e5]/50 hover:bg-[#f0e8e5]/70 border border-[#262d5c]/30 flex items-center justify-center text-[#262d5c]/70 hover:text-[#a3f9d8] transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="pt-6 border-t border-[#262d5c]/30 text-center">
          <p className="text-[#262d5c]/70 italic">
            LicenSea — Where creation flows endlessly.
          </p>
        </div>
      </div>
    </footer>
  );
}
