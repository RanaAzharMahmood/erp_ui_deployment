import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAuth } from '../../contexts/AuthContext'
import loginBg from '../../assets/images/login-bg.jpg'
import petrozenLogo from '../../assets/images/white-logo.svg'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message || 'Invalid email or password')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#FAFAFA',
      }}
    >
      {/* Left Side - Background Image with Content */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          background: `url(${loginBg}) center/cover no-repeat`,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.7) 0%, rgba(255, 107, 53, 0.3) 100%)',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <img src={petrozenLogo} alt="PETROZEN" style={{ height: '60px' }} />
        </Box>

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: { md: '48px', lg: '56px' },
              lineHeight: 1.2,
              mb: 3,
            }}
          >
            ERP System For Your Fast Work Flow
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              lineHeight: 1.6,
              maxWidth: '500px',
            }}
          >
            Lorem ipsum dolor sit amet consectetur. Condimentum pulvinar euismod ipsum odio urna vestibulum congue.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 550px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          bgcolor: 'white',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '440px',
            px: { xs: 2, sm: 4 },
          }}
        >
          {/* Mobile Logo */}
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              mb: 4,
              textAlign: 'center',
            }}
          >
            <img src={petrozenLogo} alt="PETROZEN" style={{ height: '50px' }} />
          </Box>

          {/* Welcome Text */}
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '28px', sm: '36px' },
              fontWeight: 700,
              color: '#1A1A1A',
              mb: 1,
            }}
          >
            welcome Back!
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#666666',
              mb: 4,
            }}
          >
            Log in to start your
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              id="login-error"
              role="alert"
              aria-live="polite"
              sx={{
                mb: 3,
                borderRadius: '8px',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Login form"
            role="form"
          >
            {/* Email Field */}
            <Box sx={{ mb: 3 }}>
              <Typography
                component="label"
                htmlFor="email"
                variant="body2"
                id="email-label"
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1A1A1A',
                  mb: 1,
                  display: 'block',
                }}
              >
                Email
              </Typography>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                placeholder="Input your email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                error={!!error && !email}
                inputProps={{
                  'aria-required': true,
                  'aria-invalid': !!error && !email,
                  'aria-labelledby': 'email-label',
                  'aria-describedby': error ? 'login-error' : undefined,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F5F5F5',
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B35',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '14px 16px',
                  },
                }}
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 2 }}>
              <Typography
                component="label"
                htmlFor="password"
                variant="body2"
                id="password-label"
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1A1A1A',
                  mb: 1,
                  display: 'block',
                }}
              >
                Password
              </Typography>
              <TextField
                required
                fullWidth
                name="password"
                type="password"
                id="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                error={!!error && !password}
                inputProps={{
                  'aria-required': true,
                  'aria-invalid': !!error && !password,
                  'aria-labelledby': 'password-label',
                  'aria-describedby': error ? 'login-error' : undefined,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F5F5F5',
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B35',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '14px 16px',
                  },
                }}
              />
            </Box>

            {/* Remember Me */}
            <Box sx={{ mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    inputProps={{
                      'aria-label': 'Remember me on this device',
                    }}
                    sx={{
                      color: '#CCCCCC',
                      '&.Mui-checked': {
                        color: '#FF6B35',
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '14px', color: '#666666' }}
                  >
                    Remember Me
                  </Typography>
                }
              />
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.75,
                borderRadius: '8px',
                bgcolor: '#FF6B35',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#FF5722',
                  boxShadow: 'none',
                },
                '&:disabled': {
                  bgcolor: '#CCCCCC',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage

