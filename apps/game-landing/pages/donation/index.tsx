import React from "react";
import Head from "next/head";
import Link from "next/link";
import { semangatBold, semangatRegular, lenasRegular } from "@/fonts";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import Drawer from "../../components/Layout/Drawer";
import donations_illustration from "@/public/backgrounds/donation_illustration.webp";

export default function Donation() {
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
        <title>Support the Project - Land of Landless</title>
        <meta
          name="description"
          content="Support the Land of Landless project and be part of our amazing community!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer state={open} handleClose={handleClose} />
      <Header handleOpen={handleOpen} />

      <main
        className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${donations_illustration.src})` }}
      >
        {/* Overlay for better text readability - covers entire page */}
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/85 pointer-events-none"></div>
        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-48 sm:pt-56 md:pt-64 lg:pt-48 pb-12 px-4 sm:px-6">
          <div className="w-full max-w-4xl">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <h1
                className={`${lenasRegular.className} text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4`}
              >
                Support the Project
              </h1>
              <p
                className={`${semangatRegular.className} text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8`}
              >
                Be part of something amazing!
              </p>
            </div>

            {/* CTA Section - MOVED TO TOP */}
            <div className="text-center mb-16">
              <p
                className={`${semangatRegular.className} text-base sm:text-lg text-gray-300 mb-6 max-w-2xl mx-auto`}
              >
                Click the button below to make your donation. It only takes a
                minute, and your support means everything to us! 💜
              </p>

              {/* Main Donation Button */}
              <div className="flex justify-center mb-8">
                <a
                  href={
                    process.env.NEXT_PUBLIC_DONATION_LINK ||
                    "https://pay.oxapay.com/15867447"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <button
                    className={`${semangatBold.className} px-8 sm:px-16 py-6 sm:py-7 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-2xl sm:text-3xl rounded-[30px] transition-all transform hover:scale-105 shadow-2xl hover:shadow-orange-500/50`}
                  >
                    💳 Donate Now
                  </button>
                </a>
              </div>

              {/* Important Note */}
              <div className="bg-yellow-500/10 backdrop-blur-md rounded-[20px] border border-yellow-400/30 p-6 sm:p-8 max-w-2xl mx-auto">
                <p
                  className={`${semangatBold.className} text-base sm:text-lg text-yellow-200 mb-3`}
                >
                  ⚠️ Important: Provide Your Information!
                </p>
                <p
                  className={`${semangatRegular.className} text-base sm:text-lg text-yellow-100 leading-relaxed`}
                >
                  During the donation process, you&apos;ll have the option to
                  provide:
                  <br />
                  <span className="font-semibold text-orange-300">
                    ✓ Your Name
                  </span>{" "}
                  - if you want to be featured in the public Supporters List
                  inside the game
                  <br />
                  <span className="font-semibold text-blue-300">
                    ✓ Your Solana Address
                  </span>{" "}
                  - if you want to receive exclusive gifts and rewards
                  <br />
                  <br />
                  Don&apos;t skip these fields if you want to enjoy these
                  benefits!
                </p>
              </div>
            </div>

            {/* Why Support Section */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Card 1 */}
              <div className="bg-white/5 backdrop-blur-md rounded-[25px] border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">🚀</div>
                <h3
                  className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-3`}
                >
                  Speed Development
                </h3>
                <p
                  className={`${semangatRegular.className} text-sm sm:text-base text-gray-300`}
                >
                  Your donation helps us accelerate development and bring new
                  features faster to the game.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white/5 backdrop-blur-md rounded-[25px] border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">🎮</div>
                <h3
                  className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-3`}
                >
                  Improve Experience
                </h3>
                <p
                  className={`${semangatRegular.className} text-sm sm:text-base text-gray-300`}
                >
                  Every contribution helps us improve gameplay, add content, and
                  create an unforgettable experience.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white/5 backdrop-blur-md rounded-[25px] border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-4">🌍</div>
                <h3
                  className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-3`}
                >
                  Build Community
                </h3>
                <p
                  className={`${semangatRegular.className} text-sm sm:text-base text-gray-300`}
                >
                  Support our mission to build a thriving community where
                  everyone belongs in the Land of Landless.
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-12">
              <h2
                className={`${lenasRegular.className} text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-8`}
              >
                Your Benefits
              </h2>

              <div className="space-y-4">
                {/* Benefit 1 - Supporters List */}
                <div className="bg-gradient-to-r from-orange-500/10 to-orange-400/5 backdrop-blur-md rounded-[20px] border border-orange-400/30 p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-2xl">📜</span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-2`}
                      >
                        Your Name in Supporters List
                      </h3>
                      <p
                        className={`${semangatRegular.className} text-base sm:text-lg text-gray-200 leading-relaxed`}
                      >
                        If you want to be recognized as a supporter, provide
                        your name during donation. Your name will be displayed
                        on a public banner inside the game that every player can
                        see. It&apos;s our way of saying thank you for your
                        amazing support! 🌟
                      </p>
                      <div className="mt-3 p-3 sm:p-4 bg-black/20 rounded-lg border border-orange-400/20">
                        <p className="text-sm text-orange-300 font-semibold">
                          💡 Tip: Provide your preferred name in the donation
                          form to be included in the supporters list
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefit 2 - Solana Gifts */}
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-400/5 backdrop-blur-md rounded-[20px] border border-blue-400/30 p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-2xl">🎁</span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-2`}
                      >
                        Receive Exclusive Gifts
                      </h3>
                      <p
                        className={`${semangatRegular.className} text-base sm:text-lg text-gray-200 leading-relaxed`}
                      >
                        Provide your valid Solana wallet address during donation
                        to receive exclusive gifts and rewards! As a token of
                        our appreciation, early supporters will receive special
                        in-game items and tokens directly to your wallet. 💎
                      </p>
                      <div className="mt-3 p-3 sm:p-4 bg-black/20 rounded-lg border border-blue-400/20">
                        <p className="text-sm text-blue-300 font-semibold">
                          💡 Tip: Make sure your Solana address is valid to
                          receive your gifts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefit 3 - Support */}
                <div className="bg-gradient-to-r from-purple-500/10 to-purple-400/5 backdrop-blur-md rounded-[20px] border border-purple-400/30 p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-2xl">❤️</span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`${lenasRegular.className} text-xl sm:text-2xl font-bold text-white mb-2`}
                      >
                        Direct Support to Development
                      </h3>
                      <p
                        className={`${semangatRegular.className} text-base sm:text-lg text-gray-200 leading-relaxed`}
                      >
                        Every donation goes directly towards improving the game,
                        developing new features, and supporting our team.
                        You&apos;re not just donating—you&apos;re investing in
                        the future of Land of Landless! 🚀
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-white/10 my-16"></div>

            {/* Footer CTA */}
            <div className="text-center pt-12">
              <p className={`${semangatRegular.className} text-gray-400 mb-6`}>
                Questions about donations? Check out our game or reach us on
                social media
              </p>
              <Link href="https://game.thelol.xyz" target="_blank">
                <button
                  className={`${semangatBold.className} px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-[25px] transition-all`}
                >
                  Visit the Game
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
