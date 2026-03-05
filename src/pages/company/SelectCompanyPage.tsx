import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Card, Avatar } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { useCompany } from '../../contexts/CompanyContext'
import type { Company } from '../../types/auth.types'
import petrozenLogo from '../../assets/images/petrozen-logo.svg'

const SelectCompanyPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, companies } = useAuth()
  const { selectCompany } = useCompany()

  const handleSelect = (company: Company) => {
    selectCompany(company)
    navigate('/dashboard')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 4 },
          py: 2,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={petrozenLogo} alt="PETROZEN" style={{ height: 36 }} />
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: '#374151', fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          Select Company
        </Typography>
        <Avatar
          sx={{ width: 36, height: 36, bgcolor: '#FF6B35' }}
        >
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
      </Box>

      {/* Company Grid */}
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 4 }, py: { xs: 4, sm: 6 } }}>
        <Grid container spacing={3}>
          {companies.map((company) => (
            <Grid item xs={12} sm={6} md={4} key={company.id}>
              <Card
                onClick={() => handleSelect(company)}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#FFF5F0',
                  border: '1px solid #FFE0D0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(255, 107, 53, 0.15)',
                    borderColor: '#FF6B35',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: '#374151', fontSize: '1rem' }}
                >
                  {company.name}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default SelectCompanyPage
