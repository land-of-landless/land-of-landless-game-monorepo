import { Stack, Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

type Props = {};

const Footer = (props: Props) => {
  return (
    <Stack
      id={"footer"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={(theme) => ({
        background: theme.palette.grey[900],
        // position: "absolute",
        // top: "3000vh",
        width: "100%",
        // bottom: 0,
      })}
    >
      <Stack
        justifyContent={"center"}
        alignItems={"center"}
        sx={(theme) => ({
          p: 2,
          width: "100%",
          height: "6rem",
          background: theme.palette.grey[900],
        })}
        direction="row"
        spacing={2}
      >
        {/* <Box sx={{ fontSize: { xs: "1rem", md: "1.4rem" } }}>
        lol | Land of Landless
      </Box> */}
        <Box
          sx={{
            position: "relative",
            width: { xs: "3rem", md: "4rem" },
            height: { xs: "3rem", md: "4rem" },
          }}
        >
          <Link href={"https://twitter.com/thelolxyz"} target="_blank">
            <Image src={"/icons/x_icon.png"} alt="twitter logo" fill />
          </Link>
        </Box>
        <Box
          sx={{
            position: "relative",
            width: { xs: "3rem", md: "4rem" },
            height: { xs: "3rem", md: "4rem" },
          }}
        >
          <Link href={"https://discord.gg/DKpvyqBf78"} target="_blank">
            <Image src={"/icons/discord_icon.png"} alt="discord logo" fill />
          </Link>
        </Box>
      </Stack>
      {/* <Box sx={{ color: "white", pb: 2 }}>
        <Link href="https://storyset.com/online">
          Online illustrations by Storyset
        </Link>
      </Box> */}
    </Stack>
  );
};

export default Footer;
