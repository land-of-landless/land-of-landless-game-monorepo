import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
  targetElId: string;
  fixedToBottom?: boolean;
  offset?: number; // px offset for sticky headers etc.
};

const ScrollToButton = ({ targetElId, fixedToBottom, offset = 0 }: Props) => {
  const scroll2El = (elID: string, offset = 0) => {
    const el = document.getElementById(elID);
    if (el) {
      if (offset === 0) {
        // Use scrollIntoView for most cases
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Use window.scrollTo for offset support
        const y = el.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      // Accessibility: move focus to the element
      if (typeof el.focus === "function") {
        el.setAttribute("tabindex", "-1"); // ensure focusable
        el.focus({ preventScroll: true });
      }
    }
  };

  const buttonContent = (
    <motion.button
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 1,
      }}
      className="relative w-16 h-16 cursor-pointer border-none bg-transparent p-0"
      onClick={() => {
        scroll2El(targetElId, offset);
      }}
    >
      <Image src={"/icons/mouse-cursor_2.png"} alt="mouse scroll icon" fill />
    </motion.button>
  );

  if (fixedToBottom) {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-auto z-10">
        {buttonContent}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mt-auto mb-4">
      {buttonContent}
    </div>
  );
};

export default ScrollToButton;
