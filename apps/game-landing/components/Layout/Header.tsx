import Image from "next/image";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import HeaderSocials from "./HeaderSocials";

const pages = [
  // {
  //   label: "Mint",
  //   to: "https://mint.thelol.xyz",
  //   target: "_blank",
  //   prefetch: false,
  // },
  {
    label: "Game",
    to: "https://game.thelol.xyz",
    target: "_blank",
    prefetch: false,
  },
  // {
  //   label: "Staking",
  //   to: "https://stake.thelol.xyz",
  //   target: "_blank",
  //   // prefetch: true, //default
  // },
  // {
  //   label: "Grants",
  //   to: "https://grant.thelol.xyz",
  //   target: "_blank",
  //   // prefetch: true, //default
  // },
  // { label: "News", to: "/news", target: "_parent", prefetch: true },
  // {
  //   label: "Docs",
  //   to: "https://docs.thelol.xyz",
  //   target: "_blank",
  //   prefetch: false,
  // },
];

type Props = {
  handleOpen: () => void;
};
function Header({ handleOpen }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        position: { xs: "absolute" },
        top: 10,
        left: 0,
        right: 0,
        margin: "auto",
        width: "90%",
        px: 2,
        // mt: 1,
        // py: 1,
        background: "rgba(255, 255, 255, 0.24)",
        borderRadius: "50px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5.1px)",
        "-webkit-backdrop-filter": "blur(5.1px)",
        border: "1px solid rgba(255, 255, 255, 0.37)",
        zIndex: 100,
      }}
      id="test"
    >
      <Box
        sx={{
          display: { xs: "flex" },
          justifyContent: "space-between",
          alignItems: "center",
          height: "5rem",
          // minWidth: "30rem",
          width: "100%",
          // maxWidth: "100rem",
          // mx: "auto",
          backgroundColor: {
            xs: "transparent",
          },
          boxShadow: {
            xs: "none",
          },
        }}
        // position="static"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: {
                xs: "flex",
              },
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              width: "4rem",
              height: "4rem",
            }}
          >
            <Link href="/" passHref>
              <Image
                src="/land_of_landless_logo-round.png"
                alt="lol logo"
                // width={55}
                // height={55}
                fill
                priority
              />
            </Link>
          </Box>

          <Box
            sx={{
              flexGrow: 2,
            }}
          ></Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
              justifyContent: { sx: "none", md: "flex-end" },
            }}
          >
            {pages.map((page) => (
              <Link
                style={{ margin: "0 0.8rem" }}
                href={page.to}
                key={page.to}
                passHref
                target={page.target}
                prefetch={page.prefetch}
              >
                <Box
                  key={page.label}
                  sx={{
                    my: 2,
                    color: "white",
                    display: "block",
                    fontSize: "1.2rem",
                    // "&:hover": {
                    //   background: "rgb(153,69,255)",
                    // },
                  }}
                >
                  {page.label}
                </Box>
              </Link>
            ))}
          </Box>
        </Box>
      </Box>
      {/* social links */}

      <HeaderSocials />

      {/* hamburger button */}
      <Box
        sx={{
          // flexGrow: 1,
          display: { xs: "flex" },
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => handleOpen()}
      >
        <MenuIcon fontSize="large" sx={{ color: "white", cursor: "pointer" }} />
      </Box>
    </Box>
  );
}

export default Header;
