import React from "react";

import Image from "next/image";
import { useRouter } from "next/router";

const SmallScreenDescription = () => {
  const router = useRouter();

  const handleTryAnyway = () => {
    // Force redirect to game with a query parameter
    router.push("/p?force=true");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-6 text-center bg-black text-white">
      <div className="max-w-[500px] mb-8">
        <h1 className="font-bold mb-4 text-4xl">
          Game Optimized for Larger Screens
        </h1>
        <p className="mb-6 text-lg">
          For the best gaming experience, we recommend playing on a desktop or
          tablet with a larger screen.
        </p>
      </div>
      <div className="relative w-full max-w-[350px] h-[250px]">
        <Image
          src="/images/device-preview.svg"
          alt="Device preview"
          fill
          style={{ objectFit: "contain" }}
          sizes="(max-width: 350px) 100vw, 350px"
          unoptimized
          priority
        />
      </div>
      <div className="mt-8 opacity-70">
        <p className="text-sm">
          Having issues? Try rotating your device to landscape mode
        </p>
      </div>
    </div>
  );
};

export default SmallScreenDescription;
