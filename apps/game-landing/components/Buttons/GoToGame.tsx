import React from "react";
import NextLink from "next/link";
import { semangatBold } from "@/fonts";

const GoToGame = () => {
  return (
    <NextLink
      href="https://game.thelol.xyz"
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline"
    >
      <div
        className={`${semangatBold.className} play-now-button text-xl sm:text-2xl md:text-3xl font-normal bg-[orange] px-4 sm:px-4 py-4 sm:py-5 mt-4 text-black rounded-[25px] text-center w-full mx-auto cursor-pointer hover:bg-orange-400 transition-colors min-h-[48px] flex items-center justify-center`}
      >
        <span>Play Now</span>
      </div>
    </NextLink>
  );
};

export default GoToGame;
