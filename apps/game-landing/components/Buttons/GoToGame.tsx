import React from "react";
import NextLink from "next/link";
import { semangatBold } from "@/fonts";

type Props = {};

const GoToGame = (props: Props) => {
  return (
    <NextLink
      href={"https://game.thelol.xyz"}
      target="_blank"
      className="no-underline block"
    >
      <div
        className={`${semangatBold.className} play-now-button text-2xl md:text-3xl font-normal block no-underline bg-[orange] px-0 sm:px-4 py-4 mt-4 text-black rounded-[25px] text-center w-full mx-auto cursor-pointer`}
      >
        Play Now
      </div>
    </NextLink>
  );
};

export default GoToGame;
