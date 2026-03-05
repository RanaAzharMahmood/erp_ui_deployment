import { Box, Typography } from '@mui/material'

const ActivityPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#374151' }}>
        Activity
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6B7280' }}>
        Coming Soon
      </Typography>
    </Box>
  )
}

export default ActivityPage
