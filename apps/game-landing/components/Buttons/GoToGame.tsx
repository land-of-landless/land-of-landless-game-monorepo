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
        className={`${semangatBold.className} play-now-button text-2xl md:text-3xl font-normal bg-[orange] px-2 sm:px-8 py-8 mt-8 text-black rounded-[25px] text-center w-full mx-auto cursor-pointer hover:bg-orange-400 transition-colors`}
      >
        Play Now
      </div>
    </NextLink>
  );
};

export default GoToGame;
