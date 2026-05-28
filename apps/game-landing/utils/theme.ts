import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { DMSans } from "@/fonts";

// Create a theme instance.
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  palette: {
    // mode: "dark",
    primary: {
      dark: "#ed7521",
      main: "##ff9f29",
      light: "#ffcf89",
    },
    secondary: {
      dark: "#2a44b9",
      main: "##2989ff",
      light: "#63b8ff",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
    text: {
      primary: "#000000",
      secondary: "#fff",
    },
  },

  typography: {
    button: {
      textTransform: "none",
    },
    fontFamily: DMSans.style.fontFamily,
  },
});

export default theme;
