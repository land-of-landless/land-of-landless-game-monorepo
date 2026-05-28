import React, { useEffect, useState } from "react";
import Head from "next/head";

import Header from "../components/Layout/Header";
import ReactPlayer from "react-player/lazy";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import YouTubeIcon from "@mui/icons-material/YouTube";
import Footer from "../components/Layout/Footer";
import Drawer from "../components/Layout/Drawer";
import RoadMap from "../components/RoadMap";

// import { Nanum_Pen_Script } from "next/font/google";
import {
  stencilStdBold,
  lenasRegular,
  quantumDashRegular,
  semangatBold,
  semangatRegular,
} from "@/fonts";

import { motion } from "framer-motion";

// const NanumPenScript = Nanum_Pen_Script({
//   subsets: ["latin"],
//   weight: "400",
// });

// const stencilStdBold = localFont({
//   src: "../public/fonts/Stencil_Std_Bold.ttf",
// });

import hexagon_grid_background_3 from "../public/hexagon_grid_background_3.webp";
import landing_background_1 from "@/public/backgrounds/landing_background_1.webp";
import landing_background_2 from "@/public/backgrounds/landing_background_lab_on_fire.webp";
import landing_background_3 from "@/public/backgrounds/landing_page_background_3.webp";
import landing_background_4 from "@/public/backgrounds/landing_background_4.webp";
import landing_background_5 from "@/public/backgrounds/landing_background_5.webp";
import landing_background_6 from "@/public/backgrounds/landing_background_6.webp";
import landing_background_7 from "@/public/backgrounds/landing_background_7.webp";
import landing_background_8 from "@/public/backgrounds/landing_background_8.webp";
import { useMotionValue, useSpring } from "framer-motion";
import { IconButton } from "@mui/material";
import Image from "next/image";
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

  const scroll2El = (elID: string) => {
    window.scrollTo({
      top: document.getElementById(elID)!.offsetTop,
      behavior: "smooth",
    });
  };

  // useEffect(() => {
  //   const scroll2El = (elID: string) => {
  //     window.scrollTo({
  //       top: document.getElementById(elID)!.offsetTop - 60,
  //       behavior: "smooth",
  //     });
  //   };

  //   scroll2El(scrollTargetsToHtmlIds[scrollToTarget]);
  // }, [scrollToTarget]);

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
      <Box sx={{ width: "100%" }}>
        {/* SLIDES CONTAINER: now stacks slides vertically in normal flow */}
        <Box>
          {/* Slide 1 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_1.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 15, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing1"
          >
            <Box
              sx={{
                width: { xs: "80%", md: "60%", lg: "40%", xl: "700px" },
                maxWidth: { xs: "355px", md: "400px", lg: "450px" },
                ml: { xs: 0, lg: 12 },
                mt: { xs: 10, md: 15, lg: 0 },
              }}
            >
              <Paper sx={{ borderRadius: "25px" }}>
                <Box
                  sx={{
                    fontSize: { xs: "2.2rem", md: "3rem" },
                    fontWeight: { xs: 700 },
                    px: 1,
                    py: 3,
                    color: "black",
                    border: "1px solid white",
                    borderRadius: "25px",
                  }}
                  className={lenasRegular.className}
                  textAlign="center"
                >
                  <Box>LAND OF</Box>
                  <Box>LANDLESS</Box>
                </Box>
              </Paper>
              <Box
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: { xs: 400 },
                  p: { xs: 0, sm: 1 },
                  py: { xs: 1 },
                  mt: { xs: 2 },
                  color: "white",
                  borderRadius: "5px",
                  textAlign: "center",
                }}
                className={semangatRegular.className}
              >
                Travel to Far Planets, Complete easy missions, win prizes!
              </Box>
              <GoToGame />
            </Box>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing2" fixedToBottom />
          </Box>

          {/* Slide 2 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_4.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 15, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing2"
          >
            <Box
              sx={{
                width: { xs: "80%", md: "60%", lg: "40%", xl: "700px" },
                maxWidth: { xs: "355px", md: "400px", lg: "450px" },
                ml: { xs: 0, lg: 15 },
                mt: { xs: 10, md: 15, lg: 0 },
                // Removed position absolute
              }}
            >
              <Paper sx={{ borderRadius: "25px" }}>
                <Box
                  sx={{
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    fontWeight: { xs: 700 },
                    px: 1,
                    py: 3,
                    color: "black",
                    border: "1px solid white",
                    borderRadius: "25px",
                  }}
                  className={semangatRegular.className}
                  textAlign="center"
                >
                  <Box>
                    A genius scientist, Dr Yamaka, was building a new robot!
                  </Box>
                </Box>
              </Paper>
            </Box>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing3" fixedToBottom />
          </Box>

          {/* Slide 3 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_2.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 5, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing3"
          >
            <Box
              sx={{
                width: { xs: "80%", md: "60%", lg: "40%", xl: "700px" },
                maxWidth: { xs: "355px", md: "400px", lg: "450px" },
                ml: { xs: 0, lg: 10 },
                mt: { xs: 10, md: 15, lg: 0 },
              }}
            >
              <Paper sx={{ borderRadius: "25px" }}>
                <Box
                  sx={{
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    fontWeight: { xs: 700 },
                    px: 1,
                    py: 3,
                    color: "black",
                    border: "1px solid white",
                    borderRadius: "25px",
                  }}
                  className={semangatRegular.className}
                  textAlign="center"
                >
                  <Box>
                    He Shouted: &quot;It&apos;s going out of control! Shutdown
                    the machine!&quot;
                  </Box>
                  <Box>But It was too late! Machine was conscious!</Box>
                </Box>
              </Paper>
            </Box>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing4" fixedToBottom />
          </Box>

          {/* Slide 4 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_3.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 15, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing4"
          >
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing5" fixedToBottom />
          </Box>

          {/* Slide 5 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_5.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 15, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing5"
          >
            <Box
              sx={{
                width: { xs: "80%", md: "60%", lg: "40%", xl: "700px" },
                maxWidth: { xs: "355px", md: "400px", lg: "450px" },
                ml: { xs: 0, lg: 15 },
                mt: { xs: 10, md: 15, lg: 0 },
              }}
            >
              <Paper sx={{ borderRadius: "25px" }}>
                <Box
                  sx={{
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    fontWeight: { xs: 700 },
                    px: 1,
                    py: 3,
                    color: "black",
                    border: "1px solid white",
                    borderRadius: "25px",
                  }}
                  className={semangatRegular.className}
                  textAlign="center"
                >
                  <Box>Scientist was afraid of this powerful robot!</Box>
                  <Box>He had to do something ...</Box>
                  <Box>He sent the robot to space !!</Box>
                </Box>
              </Paper>
            </Box>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing6" fixedToBottom />
          </Box>

          {/* Slide 6 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_6.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 15, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing6"
          >
            <Box
              sx={{
                width: { xs: "80%", md: "60%", lg: "40%", xl: "700px" },
                maxWidth: { xs: "355px", md: "400px", lg: "450px" },
                ml: { xs: 0, lg: 15 },
                mt: { xs: 10, md: 15, lg: 0 },
              }}
            >
              <Paper sx={{ borderRadius: "25px" }}>
                <Box
                  sx={{
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    fontWeight: { xs: 700 },
                    px: 1,
                    py: 3,
                    color: "black",
                    border: "1px solid white",
                    borderRadius: "25px",
                  }}
                  className={semangatRegular.className}
                  textAlign="center"
                >
                  <Box>Robot felt he belongs to nowhere!</Box>
                  <Box>Until it found a new home</Box>
                  <Box>He called the new Planet:</Box>
                  <Box>&quot;Land of Landless&quot;</Box>
                </Box>
              </Paper>
            </Box>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing7" fixedToBottom />
          </Box>

          {/* Slide 7 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_7.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 15, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing7"
          >
            <Box
              sx={{
                width: { xs: "80%", md: "60%", lg: "40%", xl: "700px" },
                maxWidth: { xs: "355px", md: "400px", lg: "450px" },
                ml: { xs: 0, lg: 15 },
                mt: { xs: 10, md: 15, lg: -35 },
              }}
            >
              <Paper sx={{ borderRadius: "25px" }}>
                <Box
                  sx={{
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    fontWeight: { xs: 700 },
                    px: 1,
                    py: 3,
                    color: "black",
                    border: "1px solid white",
                    borderRadius: "25px",
                  }}
                  className={semangatRegular.className}
                  textAlign="center"
                >
                  <Box>Robot built other robots!</Box>
                  <Box>They were now a colony</Box>
                  <Box>They explored the red planet and built homes there</Box>
                </Box>
              </Paper>
            </Box>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="landing8" fixedToBottom />
          </Box>

          {/* Slide 8 */}
          <Box
            sx={{
              minHeight: "100vh",
              background: `url(${landing_background_8.src}) center/cover no-repeat`,
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center" },
              gap: { md: "2rem" },
              pt: { xs: 15, lg: 15 },
              margin: "auto",
              position: "relative",
            }}
            id="landing8"
          >
            <Box
              sx={{
                width: { xs: "80%", md: "60%", lg: "40%", xl: "700px" },
                maxWidth: { xs: "355px", md: "400px", lg: "450px" },
                mr: { xs: 0, md: 15, lg: 0 },
                mt: { xs: 10, md: 15, lg: 0 },
                position: { xs: "static", lg: "absolute" },
                top: { lg: 40 },
                right: { lg: 40 },
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", lg: "flex-end" },
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Paper sx={{ borderRadius: "25px", width: "100%" }}>
                  <Box
                    sx={{
                      fontSize: { xs: "1.6rem", md: "2.2rem" },
                      fontWeight: { xs: 700 },
                      px: 1,
                      py: 3,
                      color: "black",
                      border: "1px solid white",
                      borderRadius: "25px",
                    }}
                    className={semangatRegular.className}
                    textAlign="center"
                  >
                    <Box>Take on the journey!</Box>
                    <Box>Build your base and expand</Box>
                    <Box>&quot;Land of Landless&quot;</Box>
                  </Box>
                </Paper>
                <Box sx={{ width: "100%" }}>
                  <GoToGame />
                </Box>
              </Box>
            </Box>
            {/* mouse scroll icon */}
            <ScrollToButton targetElId="roadmap" fixedToBottom />
          </Box>
        </Box>
        <RoadMap />
        {/* <Footer /> */}
      </Box>
    </>
  );
}

{
  /* <Box
                sx={{
                  color: "white",
                  mt: { xs: 6, lg: 0 },
                  width: {
                    // xs: "300px",
                    xs: "350px",
                    sm: "416px",
                    md: "672px",
                    lg: "512px",
                  },
                  height: {
                    // xs: "168.75px",
                    xs: "196.875px",
                    sm: "234px",
                    md: "378px",
                    lg: "288px",
                  },
                }}
              >
                <Box
                  className="player-wrapper"
                  sx={{
                    width: "100%",
                    height: "100%",

                    // background: "white",
                  }}
                >
                  <ReactPlayer
                    className="react-player"
                    controls
                    loop
                    url="https://www.youtube.com/watch?v=Re7fwwIXt-I"
                    // https://youtu.be/Re7fwwIXt-I
                    width={"100%"}
                    height={"100%"}
                    fallback={
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          color: "black",
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    }
                    // light
                    // light={
                    //   "https://ik.imagekit.io/landoflandless/land_of_landless/thumbnail-small-compressed.webp"
                    // }
                    light={
                      "https://cdn.thelol.xyz/banners/thumbnail-small-compressed.webp"
                    }
                    playIcon={
                      <YouTubeIcon
                        sx={{
                          fontSize: { xs: "4rem", md: "6rem" },
                          color: "red",
                        }}
                      />
                    }
                    playing
                  />
                </Box>
              </Box> */
}
