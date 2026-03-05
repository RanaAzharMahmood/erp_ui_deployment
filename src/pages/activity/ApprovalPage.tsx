import { Box, Typography } from '@mui/material'

const ApprovalPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#374151' }}>
        Approval
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#6B7280' }}>
        Coming Soon
      </Typography>
    </Box>
  )
}

export default ApprovalPage
