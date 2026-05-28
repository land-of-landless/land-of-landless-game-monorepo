import { PropsWithChildren } from "react";
import { Box } from "@mui/material";
import useToggle from "../../hooks/useToggle";
import Header from "./Header";
import Footer from "./Footer";

function Layout({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        paddingTop: "1rem",
        width: "100%",
      }}
    >
      <Header handleOpen={() => {}} />
      <Box sx={{ minHeight: "90vh" }}>{children}</Box>
      <Footer />
    </Box>
  );
}

export default Layout;
