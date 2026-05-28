import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import DrawerSocials from "./DrawerSocials";
import { Divider, Stack } from "@mui/material";
import Link from "next/link";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import RedeemIcon from "@mui/icons-material/Redeem";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArticleIcon from "@mui/icons-material/Article";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Image from "next/image";
import landOfLandlessLogo from "@/public/land_of_landless_logo-round.png";
// import CollectionsIcon from '@mui/icons-material/Collections';

type Props = {
  state: boolean;
  handleClose: () => void;
};

const pages = [
  // {
  //   label: "Mint",
  //   to: "https://mint.thelol.xyz",
  //   target: "_blank",
  //   prefetch: false,
  //   icon: <CollectionsIcon fontSize="large" />,
  // },
  // {
  //   label: "Mint",
  //   to: "https://mint.thelol.xyz",
  //   target: "_blank",
  //   prefetch: false,
  //   icon: <StorefrontIcon fontSize="large" />,
  // },
  {
    label: "Game",
    to: "https://game.thelol.xyz",
    target: "_blank",
    prefetch: false,
    icon: <SportsEsportsIcon fontSize="large" />,
  },
  // {
  //   label: "Staking",
  //   to: "https://stake.thelol.xyz",
  //   target: "_blank",
  //   // prefetch: true, //default
  //   icon: <RedeemIcon fontSize="large" />,
  // },
  // {
  //   label: "Grants",
  //   to: "https://grant.thelol.xyz",
  //   target: "_blank",
  //   // prefetch: true, //default
  //   icon: <EmojiEventsIcon fontSize="large" />,
  // },
  // {
  //   label: "News",
  //   to: "/news",
  //   target: "_parent",
  //   // prefetch: true, //default
  //   icon: <NewspaperIcon fontSize="large" />,
  // },
  {
    label: "More Info",
    to: "https://docs.thelol.xyz",
    target: "_blank",
    prefetch: false,
    icon: <ArticleIcon fontSize="large" />,
  },

  {
    label: "Privacy Policy",
    to: "/tos",
    target: "_blank",
    prefetch: false,
    icon: <ArticleIcon fontSize="large" />,
  },
];

export default function SimpleBackdrop({ state, handleClose }: Props) {
  // Helper to close drawer on internal link click
  const handleLinkClick = (to: string) => {
    if (to.startsWith("/")) handleClose();
  };

  return (
    <Drawer
      anchor="right"
      open={state}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: "24px",
          borderBottomLeftRadius: "24px",
          boxShadow: 6,
          maxWidth: "25rem",
        },
        "aria-label": "Main navigation menu",
      }}
    >
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          maxWidth: "25rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          {/* Logo */}
          <Box sx={{ display: "flex", justifyContent: "center", pt: 3, pb: 1 }}>
            <Image
              src={landOfLandlessLogo}
              alt="Land of Landless Logo"
              width={64}
              height={64}
              style={{ borderRadius: "50%" }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <IconButton
              aria-label="close side drawer button"
              onClick={handleClose}
              sx={{ mr: "2rem", my: "1rem" }}
            >
              <CloseIcon
                fontSize="large"
                sx={(theme) => ({ color: theme.palette.warning.light })}
              />
            </IconButton>
          </Box>
          <Divider />
          <Stack
            spacing={4}
            justifyContent="center"
            alignItems="center"
            sx={{ py: "2rem" }}
          >
            {pages.map((page) => (
              <Box
                key={page.to}
                sx={{
                  width: "10rem",
                  p: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0 1rem",
                  borderRadius: 2,
                  transition: "background 0.2s, transform 0.2s",
                  "&:hover, &:focus-within": {
                    background: "rgba(153,69,255,0.08)",
                    transform: "scale(1.04)",
                  },
                }}
              >
                {page.icon}
                <Link
                  style={{ margin: "0", width: "100%" }}
                  href={page.to}
                  passHref
                  target={page.target}
                  tabIndex={0}
                  onClick={() => handleLinkClick(page.to)}
                >
                  <Box
                    sx={{
                      textAlign: "start",
                      color: "black",
                      display: "block",
                      fontSize: "1.2rem",
                      fontWeight: 500,
                      outline: "none",
                      "&:focus": {
                        boxShadow: "0 0 0 2px #9969ff",
                        borderRadius: 2,
                      },
                    }}
                  >
                    {page.label}
                  </Box>
                </Link>
              </Box>
            ))}
          </Stack>
          <Divider />
          {/* // TODO: build these stuff late */}
          {/* <Box>
            <Box>coin mint key</Box>
            <Box>create token account</Box>
          </Box> */}
        </Box>
        <Box>
          <DrawerSocials />
        </Box>
      </Box>
    </Drawer>
  );
}
