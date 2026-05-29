import React, { useEffect, useState } from "react";
import Head from "next/head";

import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import Drawer from "../components/Layout/Drawer";
import RoadMap from "../components/RoadMap";

import {
  lenasRegular,
  semangatRegular,
} from "@/fonts";

import landing_background_1 from "@/public/backgrounds/landing_background_1.webp";
import landing_background_2 from "@/public/backgrounds/landing_background_lab_on_fire.webp";
import landing_background_3 from "@/public/backgrounds/landing_page_background_3.webp";
import landing_background_4 from "@/public/backgrounds/landing_background_4.webp";
import landing_background_5 from "@/public/backgrounds/landing_background_5.webp";
import landing_background_6 from "@/public/backgrounds/landing_background_6.webp";
import landing_background_7 from "@/public/backgrounds/landing_background_7.webp";
import landing_background_8 from "@/public/backgrounds/landing_background_8.webp";

import ScrollToButton from "@/components/Buttons/ScrollToButton";
import GoToGame from "@/components/Buttons/GoToGame";

export default function Home() {
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
        <title>lol | Land of Landless</title>
        <meta
          name="description"
          content="Land of landless is a RTS game with weekly prizes"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer state={open} handleClose={handleClose} />
      <Header handleOpen={handleOpen} />
      <div className="w-full">
        {/* SLIDES CONTAINER: now stacks slides vertically in normal flow */}
        <div>
          {/* Slide 1 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-30 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_1.src})` }}
            id="landing1"
          >
            <div className="w-[80%] md:w-[60%] lg:w-[40%] xl:w-[700px] max-w-[355px] md:max-w-[400px] lg:max-w-[450px] lg:ml-48 mt-20 md:mt-30 lg:mt-0">
              <div className="bg-white rounded-[25px] shadow-sm">
                <div
                  className={`${lenasRegular.className} text-[2.2rem] md:text-[3rem] font-[700] px-4 py-6 text-black border border-white rounded-[25px] text-center`}
                >
                  <div>LAND OF</div>
                  <div>LANDLESS</div>
                </div>
              </div>
              <div
                className={`${semangatRegular.className} text-[1.5rem] md:text-[2rem] font-[400] p-0 sm:p-4 py-4 mt-4 text-white rounded-md text-center`}
              >
                Travel to Far Planets, Complete easy missions, win prizes!
              </div>
              <GoToGame />
            </div>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing2" fixedToBottom />
          </section>

          {/* Slide 2 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-30 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_4.src})` }}
            id="landing2"
          >
            <div className="w-[80%] md:w-[60%] lg:w-[40%] xl:w-[700px] max-w-[355px] md:max-w-[400px] lg:max-w-[450px] lg:ml-60 mt-20 md:mt-30 lg:mt-0">
              <div className="bg-white rounded-[25px] shadow-sm">
                <div
                  className={`${semangatRegular.className} text-[1.6rem] md:text-[2.2rem] font-[700] px-4 py-6 text-black border border-white rounded-[25px] text-center`}
                >
                  <div>
                    A genius scientist, Dr Yamaka, was building a new robot!
                  </div>
                </div>
              </div>
            </div>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing3" fixedToBottom />
          </section>

          {/* Slide 3 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-20 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_2.src})` }}
            id="landing3"
          >
            <div className="w-[80%] md:w-[60%] lg:w-[40%] xl:w-[700px] max-w-[355px] md:max-w-[400px] lg:max-w-[450px] lg:ml-40 mt-20 md:mt-30 lg:mt-0">
              <div className="bg-white rounded-[25px] shadow-sm">
                <div
                  className={`${semangatRegular.className} text-[1.6rem] md:text-[2.2rem] font-[700] px-4 py-6 text-black border border-white rounded-[25px] text-center`}
                >
                  <div>
                    He Shouted: &quot;It&apos;s going out of control! Shutdown
                    the machine!&quot;
                  </div>
                  <div>But It was too late! Machine was conscious!</div>
                </div>
              </div>
            </div>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing4" fixedToBottom />
          </section>

          {/* Slide 4 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-30 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_3.src})` }}
            id="landing4"
          >
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing5" fixedToBottom />
          </section>

          {/* Slide 5 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-30 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_5.src})` }}
            id="landing5"
          >
            <div className="w-[80%] md:w-[60%] lg:w-[40%] xl:w-[700px] max-w-[355px] md:max-w-[400px] lg:max-w-[450px] lg:ml-60 mt-20 md:mt-30 lg:mt-0">
              <div className="bg-white rounded-[25px] shadow-sm">
                <div
                  className={`${semangatRegular.className} text-[1.6rem] md:text-[2.2rem] font-[700] px-4 py-6 text-black border border-white rounded-[25px] text-center`}
                >
                  <div>Scientist was afraid of this powerful robot!</div>
                  <div>He had to do something ...</div>
                  <div>He sent the robot to space !!</div>
                </div>
              </div>
            </div>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing6" fixedToBottom />
          </section>

          {/* Slide 6 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-30 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_6.src})` }}
            id="landing6"
          >
            <div className="w-[80%] md:w-[60%] lg:w-[40%] xl:w-[700px] max-w-[355px] md:max-w-[400px] lg:max-w-[450px] lg:ml-60 mt-20 md:mt-30 lg:mt-0">
              <div className="bg-white rounded-[25px] shadow-sm">
                <div
                  className={`${semangatRegular.className} text-[1.6rem] md:text-[2.2rem] font-[700] px-4 py-6 text-black border border-white rounded-[25px] text-center`}
                >
                  <div>Robot felt he belongs to nowhere!</div>
                  <div>Until it found a new home</div>
                  <div>He called the new Planet:</div>
                  <div>&quot;Land of Landless&quot;</div>
                </div>
              </div>
            </div>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing7" fixedToBottom />
          </section>

          {/* Slide 7 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-30 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_7.src})` }}
            id="landing7"
          >
            <div className="w-[80%] md:w-[60%] lg:w-[40%] xl:w-[700px] max-w-[355px] md:max-w-[400px] lg:max-w-[450px] lg:ml-60 mt-20 md:mt-30 lg:-mt-[140px]">
              <div className="bg-white rounded-[25px] shadow-sm">
                <div
                  className={`${semangatRegular.className} text-[1.6rem] md:text-[2.2rem] font-[700] px-4 py-6 text-black border border-white rounded-[25px] text-center`}
                >
                  <div>Robot built other robots!</div>
                  <div>They were now a colony</div>
                  <div>They explored the red planet and built homes there</div>
                </div>
              </div>
            </div>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing8" fixedToBottom />
          </section>

          {/* Slide 8 */}
          <section
            className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col lg:flex-row justify-between items-center gap-4 pt-30 lg:pt-30 mx-auto relative"
            style={{ backgroundImage: `url(${landing_background_8.src})` }}
            id="landing8"
          >
            <div className="w-[80%] md:w-[60%] lg:w-[40%] xl:w-[700px] max-w-[355px] md:max-w-[400px] lg:max-w-[450px] md:mr-60 lg:mr-0 mt-20 md:mt-30 lg:mt-0 static lg:absolute lg:top-10 lg:right-10 flex flex-col items-center lg:items-end">
              <div className="w-full">
                <div className="bg-white rounded-[25px] shadow-sm w-full">
                  <div
                    className={`${semangatRegular.className} text-[1.6rem] md:text-[2.2rem] font-[700] px-4 py-6 text-black border border-white rounded-[25px] text-center`}
                  >
                    <div>Take on the journey!</div>
                    <div>Build your base and expand</div>
                    <div>&quot;Land of Landless&quot;</div>
                  </div>
                </div>
                <div className="w-full">
                  <GoToGame />
                </div>
              </div>
            </div>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="roadmap" fixedToBottom />
          </section>
        </div>
        <RoadMap />
      </div>
    </>
  );
}
