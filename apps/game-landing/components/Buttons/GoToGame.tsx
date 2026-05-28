import { Box } from "@mui/material";
import React from "react";
import NextLink from "next/link";
import { Link } from "@mui/material";

import { semangatBold } from "@/fonts";

type Props = {};

const GoToGame = (props: Props) => {
  return (
    <Link
      component={NextLink}
      href={"https://game.thelol.xyz"}
      target="_blank"
      // className={semangatBold.className}
      // sx={{
      //   fontSize: { xs: "1.5rem", md: "2rem" },
      //   fontWeight: { xs: 400 },
      //   display: "block",
      //   textDecoration: "none",
      //   backgroundColor: "orange",
      //   p: { xs: 0, sm: 1 },
      //   py: { xs: 2 },
      //   mt: { xs: 2 },
      //   color: "black",
      //   borderRadius: "25px",
      //   textAlign: "center",
      //   width: "100%",
      //   margin: "auto",
      // }}
      sx={{
        textDecoration: "none",
      }}
    >
      <Box
        className={`${semangatBold.className} play-now-button`}
        sx={{
          fontSize: { xs: "1.5rem", md: "2rem" },
          fontWeight: { xs: 400 },
          display: "block",
          textDecoration: "none",
          backgroundColor: "orange",
          p: { xs: 0, sm: 1 },
          py: { xs: 2 },
          mt: { xs: 2 },
          color: "black",
          borderRadius: "25px",
          textAlign: "center",
          width: "100%",
          margin: "auto",
          cursor: "pointer",
        }}
      >
        Play Now
      </Box>
    </Link>
  );
};

export default GoToGame;
