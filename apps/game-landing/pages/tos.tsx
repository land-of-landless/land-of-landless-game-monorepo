import React from "react";
import {
  Typography,
  Box,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import InfoIcon from "@mui/icons-material/Info";
import EmailIcon from "@mui/icons-material/Email";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import Image from "next/image";
import { semangatBold, semangatRegular } from "@/fonts";
import landOfLandlessLogo from "@/public/land_of_landless_logo-round.png";

const Tos = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        py: { xs: 4, md: 8 },
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          maxWidth: {
            xs: "100%",
            sm: "600px",
            md: "800px",
            lg: "1000px",
            xl: "1200px",
          },
          width: "100%",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            p: { xs: 3, sm: 5, md: 6, lg: 8 },
            boxShadow: 6,
            background: "rgba(255,255,255,0.98)",
          }}
        >
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            {/* Logo and Brand Section */}
            <Box sx={{ mb: 3 }}>
              <Image
                src={landOfLandlessLogo}
                alt="Land of Landless Logo"
                width={80}
                height={80}
                style={{ marginBottom: "16px" }}
              />
              <Typography
                variant="h3"
                className={semangatBold.className}
                sx={{
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                  color: "#FF6B35",
                  mb: 1,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Land of Landless
              </Typography>
              <Typography
                variant="h5"
                className={semangatRegular.className}
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                  color: "#2C3E50",
                  mb: 2,
                }}
              >
                Legal & Privacy Information
              </Typography>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, #FF6B35, transparent)",
                }}
              />
              <PrivacyTipIcon
                sx={{
                  fontSize: 32,
                  color: "#FF6B35",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                }}
              />
              <Box
                sx={{
                  width: 40,
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, #FF6B35, transparent)",
                }}
              />
            </Box>

            <Typography
              variant="body1"
              className={semangatRegular.className}
              sx={{
                color: "#5A6C7D",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                maxWidth: "400px",
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Your privacy matters to us, Emperor! 🛡️
              <br />
              Read how we protect your data in the digital realm.
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Privacy Policy Section */}
          <Box mb={4}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Privacy
              Policy
            </Typography>
            <List>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Information Collection"
                  secondary={
                    <>
                      We use cookies to gain stats like number of visits and
                      other common non-private info about our users.
                      <br />
                      In case of social authentication (e.g. connecting your
                      Google account) we only collect a unique numerical
                      identifier to identify you. We don’t save any private info
                      including your name, email, or profile image.
                    </>
                  }
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Information Sharing"
                  secondary={
                    <>
                      We don’t share any information with any third party or any
                      entity.
                      <br />
                      We don’t collect much info at the first place anyway.
                    </>
                  }
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Data Security"
                  secondary={
                    <>
                      We use common security practices like 2FA, clusters,
                      role-based access, and etc.
                    </>
                  }
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <GavelIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Data Retention"
                  secondary="We store user generated data and progress in our games in
                      variety of databases. including Redis and MongoDB."
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <PrivacyTipIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Children’s Privacy"
                  secondary={
                    <>
                      We don’t have much of gruesome or harmful content on our
                      website or subdomains but to adhere to possible rules, we
                      only offer this website and subdomains to adults. Adults
                      in different countries may be considered in different
                      ages, but we consider it 18 and above to follow standards.
                    </>
                  }
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Changes to Privacy Policy"
                  secondary={
                    <>
                      This Document may get updated later and we reserve the
                      right to add or remove new element to it.
                    </>
                  }
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Contact Us"
                  secondary={
                    <>
                      You can always reach us at our socials and emails:
                      <br />
                      contact@thelol.xyz
                    </>
                  }
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Terms of Service Section */}
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              <GavelIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Terms of
              Service
            </Typography>
            <List>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="By using this website, you agree to this terms of service:"
                  sx={{ color: "text.primary" }}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <GavelIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Forbidden Activity"
                  secondary={
                    <>
                      You agree to never promote hateful content towards a race,
                      nationality, religion, sexual orientation or any group of
                      people who cherish a certain belief or practice.
                      <br />
                      You agree to never use hateful or inappropriate names or
                      related data in your user profiles.
                      <br />
                      You agree to not spam, ddos or maliciously try to abuse
                      the website or other things around it.
                    </>
                  }
                  sx={{ color: "text.primary" }}
                  secondaryTypographyProps={{ sx: { color: "#555" } }}
                />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Tos;
