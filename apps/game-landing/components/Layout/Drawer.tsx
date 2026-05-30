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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-[200]"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[25rem] bg-white z-[201] shadow-2xl rounded-l-[24px] overflow-hidden"
            aria-label="Main navigation menu"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Logo and Close Button */}
                <div className="flex justify-between items-center px-8 pt-8 pb-4">
                  <Image
                    src={landOfLandlessLogo}
                    alt="Land of Landless Logo"
                    width={64}
                    height={64}
                    className="rounded-full shadow-md"
                  />
                  <button
                    aria-label="close side drawer button"
                    onClick={handleClose}
                    className="p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={32} />
                  </button>
                </div>

                <div className="px-8 mb-8">
                  <hr className="border-gray-200" />
                </div>

                <nav className="flex flex-col px-8 space-y-6">
                  {pages.map((page) => (
                    <Link
                      key={page.to}
                      href={page.to}
                      target={page.target}
                      prefetch={page.prefetch}
                      onClick={() => handleLinkClick(page.to)}
                      className="flex items-center gap-6 p-4 rounded-2xl transition-all hover:bg-orange-50 group no-underline"
                    >
                      <div className="text-orange-600 group-hover:scale-110 transition-transform">
                        {page.icon}
                      </div>
                      <span className="text-gray-900 text-2xl font-bold">
                        {page.label}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="pb-12 border-t border-gray-100 pt-8">
                <DrawerSocials />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
