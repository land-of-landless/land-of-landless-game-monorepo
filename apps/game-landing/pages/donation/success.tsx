import React from "react";
import Head from "next/head";
import Link from "next/link";
import { semangatBold, semangatRegular, lenasRegular } from "@/fonts";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import Drawer from "../../components/Layout/Drawer";
import donations_illustration from "@/public/backgrounds/donation_illustration.webp";

export default function DonationSuccess() {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Head>
        <title>Donation Successful - Land of Landless</title>
        <meta
          name="description"
          content="Thank you for your generous donation to Land of Landless!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer state={open} handleClose={handleClose} />
      <Header handleOpen={handleOpen} />

      <main
        className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed flex flex-col items-center justify-center pt-48 sm:pt-56 md:pt-64 lg:pt-48 pb-12 px-4 sm:px-6"
        style={{ backgroundImage: `url(${donations_illustration.src})` }}
      >
        {/* Overlay for better text readability - covers entire page */}
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/85 pointer-events-none"></div>
        {/* Content Wrapper */}
        <div className="relative z-10">
          <div className="w-full max-w-2xl">
            {/* Success Icon/Checkmark */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Main Heading */}
            <div className="text-center mb-8">
              <h1
                className={`${semangatBold.className} text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4`}
              >
                Thank You! 🙏
              </h1>
              <p
                className={`${semangatRegular.className} text-xl sm:text-2xl text-gray-200`}
              >
                Your generous donation has been received
              </p>
            </div>

            {/* Content Box 1 - Supporters List */}
            <div className="bg-white/10 backdrop-blur-md rounded-[25px] border border-white/20 p-6 sm:p-8 mb-6 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    👥
                  </span>
                </div>
                <div className="flex-1">
                  <h2
                    className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-2`}
                  >
                    You&apos;re in the Supporters List
                  </h2>
                  <p
                    className={`${semangatRegular.className} text-base sm:text-lg text-gray-100 leading-relaxed`}
                  >
                    The name you provided in the donation will be displayed in
                    our
                    <span className="text-orange-400 font-semibold">
                      {" "}
                      Supporters List
                    </span>
                    , giving you recognition for your amazing support to the
                    Land of Landless community!
                  </p>
                </div>
              </div>
            </div>

            {/* Content Box 2 - Solana Address */}
            <div className="bg-white/10 backdrop-blur-md rounded-[25px] border border-white/20 p-6 sm:p-8 mb-8 hover:bg-white/15 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    🎁
                  </span>
                </div>
                <div className="flex-1">
                  <h2
                    className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-2`}
                  >
                    Receive Gifts on Solana
                  </h2>
                  <p
                    className={`${semangatRegular.className} text-base sm:text-lg text-gray-100 leading-relaxed`}
                  >
                    If you provided a valid{" "}
                    <span className="text-blue-400 font-semibold">
                      Solana address
                    </span>{" "}
                    during donation, you&apos;ll be able to receive special
                    gifts and rewards from the Land of Landless team. Keep an
                    eye on your wallet! 💎
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="block">
                <button
                  className={`${semangatBold.className} w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg sm:text-xl rounded-[25px] transition-all transform hover:scale-105 shadow-lg`}
                >
                  Back to Home
                </button>
              </Link>
              <Link href="https://game.thelol.xyz" target="_blank">
                <button
                  className={`${semangatBold.className} w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg sm:text-xl rounded-[25px] transition-all transform hover:scale-105 shadow-lg`}
                >
                  Play the Game
                </button>
              </Link>
            </div>

            {/* Footer Message */}
            <div className="mt-12 text-center">
              <p
                className={`${semangatRegular.className} text-sm sm:text-base text-gray-300`}
              >
                Questions? Reach out to us on our social channels
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
