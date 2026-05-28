import { Stack, Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

type Props = {};

const Footer = (props: Props) => {
  return (
    <Stack
      justifyContent={"center"}
      alignItems={"center"}
      sx={(theme) => ({
        pr: 5,
        pl: 3,
        width: "auto",
        height: "5rem",
        // background: theme.palette.grey[900],
        // mt: 1,
      })}
      direction="row"
      spacing={1}
    >
      {/* <Box sx={{ fontSize: { xs: "1rem", md: "1.4rem" } }}>
        lol | Land of Landless
      </Box> */}
      <Box
        sx={{
          position: "relative",
          width: "3rem",
          height: "3rem",
        }}
      >
        <Link href={"https://twitter.com/thelolxyz"} target="_blank">
          <Image src={"/icons/x_icon.png"} alt="twitter logo" fill />
        </Link>
      </Box>
      <Box
        sx={{
          position: "relative",
          width: "3rem",
          height: "3rem",
        }}
      >
        <Link href={"https://discord.gg/DKpvyqBf78"} target="_blank">
          <Image src={"/icons/discord_icon.png"} alt="discord logo" fill />
        </Link>
      </Box>
    </Stack>
  );
};

export default Footer;
