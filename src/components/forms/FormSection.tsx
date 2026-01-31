import React, { useId } from 'react';
import { Box, Card, Typography } from '@mui/material';

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
  /** Optional custom ID for the section title (for aria-labelledby) */
  titleId?: string;
}

/**
 * Reusable form section component
 * Used across all add/edit pages for consistent styling
 * Includes accessibility attributes (role="group" and aria-labelledby)
 */
const FormSection: React.FC<FormSectionProps> = ({ title, icon, children, sx, titleId }) => {
  const generatedId = useId();
  const sectionTitleId = titleId || `form-section-title-${generatedId}`;

  return (
    <Card
      sx={{ p: 3, borderRadius: 2, ...sx }}
      role="group"
      aria-labelledby={sectionTitleId}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            bgcolor: 'rgba(255, 107, 53, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          {React.cloneElement(icon as React.ReactElement, {
            sx: { color: '#FF6B35', fontSize: 24 },
          })}
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
          id={sectionTitleId}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Card>
  );
};

export default FormSection;
