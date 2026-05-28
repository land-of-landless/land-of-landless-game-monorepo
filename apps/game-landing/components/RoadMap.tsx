import * as React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import Image from "next/image";
// MonetizationOnIcon replaced with prize_with_ribbon_red.png
import RedeemIcon from "@mui/icons-material/Redeem";
// RepeatIcon replaced with repeat_green.png
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { semangatRegular, semangatBold, PoppinsFont } from "@/fonts";
import Footer from "./Layout/Footer";

const RoadMapComp = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "800vh",
        width: "100%",
      }}
      id={"roadmap"}
    >
      <Box
        // maxWidth="xl"
        sx={{
          // position: "absolute",
          // top: "800vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FAF3E3",
        }}
      >
        <Box
          className={semangatBold.className}
          sx={{ fontSize: { xs: "3rem", sm: "4rem", md: "4rem" }, pt: 4 }}
        >
          Explain like I&apos;m 5
        </Box>

        <Timeline position="alternate" sx={{ px: 0 }}>
          <TimelineItem>
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                fontFamily: semangatRegular.style.fontFamily,
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.6rem",
                  md: "2rem",
                  lg: "2.5rem",
                },
                pr: { xs: 1, sm: 2 },
                pl: { xs: 0.5, sm: 1, md: 2 },
              }}
              align="right"
              variant="body2"
              color="secondary.dark"
            >
              <s>Simon</s> Emperor says
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary" variant="outlined">
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                  }}
                >
                  <Image
                    src="/icons/expansion_yellow_like_sun.png"
                    alt="Expansion"
                    width={40}
                    height={40}
                    style={{
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent
              sx={{
                py: { xs: "24px", sm: "36px", md: "4rem" },
                pl: { xs: 1, sm: 2 },
                pr: { xs: 0.5, sm: 1, md: 2 },
              }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontFamily: semangatRegular.style.fontFamily,
                  fontSize: {
                    xs: "1.7rem",
                    sm: "1.8rem",
                    md: "1.9rem",
                    lg: "2rem",
                  },
                  fontWeight: "bold",
                }}
                // className={PoppinsFont.className}
              >
                Complete missions soldier!
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontFamily: semangatRegular.style.fontFamily,
                  fontSize: {
                    xs: "1.2rem",
                    sm: "1.3rem",
                    md: "1.4rem",
                    lg: "1.5rem",
                  },
                  fontWeight: "bold",
                  // fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  color: theme.palette.grey[900],
                })}
                // className={PoppinsFont.className}
              >
                For LOL! For Expansion! For Juicy Prizes!
              </Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                fontFamily: semangatRegular.style.fontFamily,
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.6rem",
                  md: "2rem",
                  lg: "2.5rem",
                },
                pl: { xs: 1, sm: 2 },
                pr: 0.5,
              }}
              variant="body2"
              color="secondary.dark"
            >
              Gamer🎮 or a Degen🐒, you&apos;re welcome!
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary" variant="outlined">
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                  }}
                >
                  <Image
                    src="/icons/prize_with_ribbon_red.png"
                    alt="Prize"
                    width={40}
                    height={40}
                    style={{
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent
              sx={{
                py: { xs: "24px", sm: "36px", md: "4rem" },
                pr: { xs: 1, sm: 2 },
                pl: 0.5,
              }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontFamily: semangatRegular.style.fontFamily,
                  fontSize: {
                    xs: "1.7rem",
                    sm: "1.8rem",
                    md: "1.9rem",
                    lg: "2rem",
                  },
                  fontWeight: "bold",
                }}
                // className={PoppinsFont.className}
              >
                Let&apos;s share a memecoin!
              </Typography>
              <Typography
                sx={(theme) => ({
                  // fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  fontFamily: semangatRegular.style.fontFamily,
                  fontSize: {
                    xs: "1.2rem",
                    sm: "1.3rem",
                    md: "1.4rem",
                    lg: "1.5rem",
                  },
                  fontWeight: "bold",
                  color: theme.palette.grey[900],
                })}
                // className={PoppinsFont.className}
              >
                You do missions, Emperor gives you candy!
              </Typography>
            </TimelineContent>
          </TimelineItem>
          {/* <TimelineItem>
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                fontFamily: semangatRegular.style.fontFamily,
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.6rem",
                  md: "2rem",
                  lg: "2.5rem",
                },
                pr: { xs: 1, sm: 2 },
                pl: 0.5,
              }}
              align="right"
              variant="body2"
              color="secondary.dark"
            >
              YaY! your ticket won ...
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary" variant="outlined">
                <RedeemIcon
                  sx={{
                    fontSize: {
                      xs: "2rem",
                      sm: "2.5rem",
                      md: "3rem",
                      lg: "3.5rem",
                    },
                  }}
                />
              </TimelineDot>
              <TimelineConnector sx={{ bgcolor: "secondary.main" }} />
            </TimelineSeparator>
            <TimelineContent
              sx={{
                py: { xs: "24px", sm: "36px", md: "4rem" },
                pl: { xs: 1, sm: 2 },
                pr: 0.5,
              }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontFamily: semangatRegular.style.fontFamily,
                  fontSize: {
                    xs: "1.7rem",
                    sm: "1.8rem",
                    md: "1.9rem",
                    lg: "2rem",
                  },
                  fontWeight: "bold",
                }}
                // className={PoppinsFont.className}
              >
                Juicy Prizes
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  color: theme.palette.grey[900],
                })}
                className={PoppinsFont.className}
              >
                Try your chance for amazing prizes
              </Typography>
            </TimelineContent>
          </TimelineItem> */}
          <TimelineItem>
            <TimelineOppositeContent
              sx={{
                m: "auto 0",
                fontFamily: semangatRegular.style.fontFamily,
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.6rem",
                  md: "2rem",
                  lg: "2.5rem",
                },
                pl: { xs: 1, sm: 2 },
                pr: 0.5,
              }}
              align="right"
              variant="body2"
              color="secondary.dark"
            >
              Help Emperor Tai Colonize!
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector sx={{ bgcolor: "secondary.main" }} />
              <TimelineDot color="primary" variant="outlined">
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                  }}
                >
                  <Image
                    src="/icons/repeat_green.png"
                    alt="Repeat"
                    width={40}
                    height={40}
                    style={{
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent
              sx={{
                py: { xs: "24px", sm: "36px", md: "4rem" },
                pr: { xs: 1, sm: 2 },
                pl: 0.5,
              }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontFamily: semangatRegular.style.fontFamily,
                  fontSize: {
                    xs: "1.7rem",
                    sm: "1.8rem",
                    md: "1.9rem",
                    lg: "2rem",
                  },
                  fontWeight: "bold",
                }}
                // className={PoppinsFont.className}
              >
                Ops! Emperor spotted new planets
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontFamily: semangatRegular.style.fontFamily,
                  fontSize: {
                    xs: "1.2rem",
                    sm: "1.3rem",
                    md: "1.4rem",
                    lg: "1.5rem",
                  },
                  fontWeight: "bold",
                  // fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  color: theme.palette.grey[900],
                })}
                // className={PoppinsFont.className}
              >
                we need help, invite your friends!
              </Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Box>
      <Footer />
    </Box>
  );
};

export default RoadMapComp;
