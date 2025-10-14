import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold', fontSize: { xs: '4rem', md: '6rem' } }}>
            404
          </Typography>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you are looking for does not exist.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            component={Link} 
            href="/"
            size="large"
          >
            Return Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
