import { Box, Container, Typography, Button, Grid } from "@mui/material";
import Link from "next/link";

export default function Footer() {
  return (
    <Box sx={{ bgcolor: 'grey.100', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container justifyContent="center">
          <Grid item xs={12} textAlign="center">
            <Typography variant="h6" sx={{ mb: 1 }}>
              CHWOne Platform
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Women Leading for Wellness & Justice
            </Typography>
            <Box>
              <Button variant="text" size="small" sx={{ mx: 1 }}>
                LinkedIn
              </Button>
              <Button variant="text" size="small" sx={{ mx: 1 }}>
                Twitter
              </Button>
              <Button variant="text" size="small" sx={{ mx: 1 }}>
                Facebook
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
