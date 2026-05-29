import React from "react";
import { X, Gamepad2, FileText } from "lucide-react";
import DrawerSocials from "./DrawerSocials";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import landOfLandlessLogo from "@/public/land_of_landless_logo-round.png";

type Props = {
  state: boolean;
  handleClose: () => void;
};

const pages = [
  {
    label: "Game",
    to: "https://game.thelol.xyz",
    target: "_blank",
    prefetch: false,
    icon: <Gamepad2 size={32} />,
  },
  {
    label: "More Info",
    to: "https://docs.thelol.xyz",
    target: "_blank",
    prefetch: false,
    icon: <FileText size={32} />,
  },
  {
    label: "Privacy Policy",
    to: "/tos",
    target: "_blank",
    prefetch: false,
    icon: <FileText size={32} />,
  },
];

export default function SimpleBackdrop({ state, handleClose }: Props) {
  const handleLinkClick = (to: string) => {
    if (to.startsWith("/")) handleClose();
  };

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 z-[200]"
        />
      )}
      {state && (
        <motion.div
          key="drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 bottom-0 w-full max-w-[25rem] bg-white z-[201] shadow-2xl rounded-l-[24px] overflow-hidden"
          aria-label="Main navigation menu"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Logo */}
              <div className="flex justify-center pt-6 pb-4">
                <Image
                  src={landOfLandlessLogo}
                  alt="Land of Landless Logo"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              </div>
              <div className="flex justify-end pr-8 py-4">
                <button
                  aria-label="close side drawer button"
                  onClick={handleClose}
                  className="p-2 text-[#ffcf89] hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={32} />
                </button>
              </div>
              <hr className="border-gray-200" />
              <nav className="flex flex-col items-center py-4 space-y-4">
                {pages.map((page) => (
                  <div
                    key={page.to}
                    className="w-40 p-1 flex items-center gap-4 rounded-lg transition-all hover:bg-[#9945ff14] hover:scale-105"
                  >
                    <div className="text-gray-700">{page.icon}</div>
                    <Link
                      href={page.to}
                      target={page.target}
                      prefetch={page.prefetch}
                      onClick={() => handleLinkClick(page.to)}
                      className="w-full text-left text-black block text-[1.2rem] font-medium no-underline focus:ring-2 focus:ring-[#9969ff] focus:rounded-lg outline-none"
                    >
                      {page.label}
                    </Link>
                  </div>
                ))}
              </nav>
              <hr className="border-gray-200" />
            </div>
            <div>
              <DrawerSocials />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
