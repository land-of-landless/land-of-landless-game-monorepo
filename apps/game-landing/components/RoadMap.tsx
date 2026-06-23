import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { semangatRegular, semangatBold } from "@/fonts";
import Footer from "./Layout/Footer";

const RoadMapComp = () => {
  return (
    <div className="absolute top-[800vh] w-full" id={"roadmap"}>
      <div className="w-full flex flex-col justify-between items-center bg-[#FAF3E3]">
        <div
          className={`${semangatBold.className} text-[3rem] sm:text-[4rem] md:text-[4rem] pt-8 text-[#000000]`}
        >
          Explain like I&apos;m 5
        </div>

        <div className="relative w-full max-w-6xl mx-auto py-8 px-4">
          {/* Vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-300 hidden sm:block" />

          {/* Timeline items */}
          <div className="space-y-32">
            {/* Item 1 */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center">
              <div className="w-full sm:w-1/2 sm:pr-12 text-center sm:text-right">
                <div
                  className={`${semangatRegular.className} text-[1.3rem] sm:text-[1.6rem] md:text-[2rem] lg:text-[2.5rem] text-secondary-dark`}
                >
                  <s>Simon</s> Emperor says
                </div>
              </div>
              <div className="relative z-10 my-4 sm:my-0">
                <div className="w-16 h-16 rounded-full border-2 border-primary bg-[#FAF3E3] flex items-center justify-center p-2">
                  <Image
                    src="/icons/expansion_yellow_like_sun.png"
                    alt="Expansion"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2 sm:pl-12 text-center sm:text-left">
                <div
                  className={`${semangatRegular.className} text-[1.7rem] sm:text-[1.8rem] md:text-[1.9rem] lg:text-[2rem] font-bold text-black`}
                >
                  Complete missions soldier!
                </div>
                <div
                  className={`${semangatRegular.className} text-[1.2rem] sm:text-[1.3rem] md:text-[1.4rem] lg:text-[1.5rem] font-bold text-gray-900`}
                >
                  For LOL! For Expansion! For Juicy Prizes!
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="relative flex flex-col sm:flex-row-reverse items-center justify-center">
              <div className="w-full sm:w-1/2 sm:pl-12 text-center sm:text-left">
                <div
                  className={`${semangatRegular.className} text-[1.3rem] sm:text-[1.6rem] md:text-[2rem] lg:text-[2.5rem] text-secondary-dark`}
                >
                  Gamer🎮 or a Degen🐒, you&apos;re welcome!
                </div>
              </div>
              <div className="relative z-10 my-4 sm:my-0">
                <div className="w-16 h-16 rounded-full border-2 border-primary bg-[#FAF3E3] flex items-center justify-center p-2">
                  <Image
                    src="/icons/prize_with_ribbon_red.png"
                    alt="Prize"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2 sm:pr-12 text-center sm:text-right">
                <div
                  className={`${semangatRegular.className} text-[1.7rem] sm:text-[1.8rem] md:text-[1.9rem] lg:text-[2rem] font-bold text-black`}
                >
                  Let&apos;s share a memecoin!
                </div>
                <div
                  className={`${semangatRegular.className} text-[1.2rem] sm:text-[1.3rem] md:text-[1.4rem] lg:text-[1.5rem] font-bold text-gray-900`}
                >
                  You do missions, Emperor gives you candy!
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center">
              <div className="w-full sm:w-1/2 sm:pr-12 text-center sm:text-right">
                <div
                  className={`${semangatRegular.className} text-[1.3rem] sm:text-[1.6rem] md:text-[2rem] lg:text-[2.5rem] text-secondary-dark`}
                >
                  Help Emperor Tai Colonize!
                </div>
              </div>
              <div className="relative z-10 my-4 sm:my-0">
                <div className="w-16 h-16 rounded-full border-2 border-primary bg-[#FAF3E3] flex items-center justify-center p-2">
                  <Image
                    src="/icons/repeat_green.png"
                    alt="Repeat"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2 sm:pl-12 text-center sm:text-left">
                <div
                  className={`${semangatRegular.className} text-[1.7rem] sm:text-[1.8rem] md:text-[1.9rem] lg:text-[2rem] font-bold text-black`}
                >
                  Ops! Emperor spotted new planets
                </div>
                <div
                  className={`${semangatRegular.className} text-[1.2rem] sm:text-[1.3rem] md:text-[1.4rem] lg:text-[1.5rem] font-bold text-gray-900`}
                >
                  we need help, invite your friends!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation CTA Section */}
      <div className="w-full bg-gradient-to-r from-orange-600/20 to-orange-500/20 border-t border-orange-400/30 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`${semangatBold.className} text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4`}
          >
            Help Us Build the Future 🚀
          </h2>
          <p
            className={`${semangatRegular.className} text-base sm:text-lg text-gray-200 mb-8 max-w-2xl mx-auto`}
          >
            Your donation directly supports the development of Land of Landless.
            Be part of our community and receive exclusive rewards!
          </p>
          <Link href="/donation">
            <button
              className={`${semangatBold.className} px-8 sm:px-12 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg sm:text-xl rounded-[25px] transition-all transform hover:scale-105 shadow-lg`}
            >
              💖 Support Us Today
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoadMapComp;
