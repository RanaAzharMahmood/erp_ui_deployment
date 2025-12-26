import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F5F5F5',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {/* 404 Illustration */}
          <Box
            sx={{
              position: 'relative',
              mb: 2,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '120px', sm: '180px' },
                fontWeight: 800,
                color: 'rgba(255, 107, 53, 0.1)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              404
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#FF6B35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '40px',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                ?
              </Typography>
            </Box>
          </Box>

          {/* Error Message */}
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1A1A1A',
                mb: 2,
              }}
            >
              Page Not Found
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: '400px',
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Oops! The page you're looking for doesn't exist. It might have been
              moved or deleted.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' },
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                px: 4,
                py: 1.5,
                textTransform: 'none',
                borderColor: '#E0E0E0',
                color: '#666666',
                '&:hover': {
                  borderColor: '#FF6B35',
                  bgcolor: 'rgba(255, 107, 53, 0.04)',
                  color: '#FF6B35',
                },
              }}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                px: 4,
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#FF8E53',
                },
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              }}
            >
              Go to Dashboard
            </Button>
          </Box>

          {/* Additional Help Text */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              If you believe this is a mistake, please contact support
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
