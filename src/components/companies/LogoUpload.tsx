import React, { memo, useCallback } from 'react';
import { Box, IconButton, Avatar, Typography } from '@mui/material';
import {
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface LogoUploadProps {
  logoPreview: string;
  onLogoUpload: (file: File) => void | Promise<void>;
  onLogoRemove?: () => void;
  showEditDelete?: boolean;
}

/**
 * Shared logo upload component
 * Used by both AddCompanyPage and UpdateCompanyPage
 */
const LogoUpload: React.FC<LogoUploadProps> = memo(({
  logoPreview,
  onLogoUpload,
  onLogoRemove,
  showEditDelete = true,
}) => {
  const inputId = 'company-logo-upload';

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await onLogoUpload(file);
      }
      // Reset the input so the same file can be selected again
      e.target.value = '';
    },
    [onLogoUpload]
  );

  const handleClick = useCallback(() => {
    document.getElementById(inputId)?.click();
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        border: '2px dashed #E0E0E0',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: logoPreview && showEditDelete ? 'default' : 'pointer',
        bgcolor: logoPreview ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
        transition: 'all 0.3s ease',
        '&:hover': logoPreview
          ? {}
          : {
              borderColor: '#FF6B35',
              bgcolor: 'rgba(255, 107, 53, 0.02)',
            },
      }}
      onClick={!logoPreview ? handleClick : undefined}
    >
      {logoPreview ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={logoPreview}
            variant="rounded"
            sx={{
              width: 200,
              height: 120,
              mx: 'auto',
              '& img': {
                objectFit: 'contain',
              },
            }}
          />
          {showEditDelete && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={handleClick}
                aria-label="Change company logo"
                sx={{
                  bgcolor: 'white',
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <EditIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
              </IconButton>
              {onLogoRemove && (
                <IconButton
                  size="small"
                  onClick={onLogoRemove}
                  aria-label="Remove company logo"
                  sx={{
                    bgcolor: 'white',
                    boxShadow: 1,
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18, color: '#EF5350' }} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      ) : (
        <>
          <IconButton
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(255, 107, 53, 0.1)',
              mb: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 107, 53, 0.2)',
              },
            }}
            aria-hidden="true"
            tabIndex={-1}
          >
            <ImageIcon sx={{ color: '#FF6B35', fontSize: 32 }} />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }} id="logo-upload-title">
            Upload Company logo
          </Typography>
          <Typography variant="caption" color="text.secondary" id="logo-upload-hint">
            SVG, PNG, JPG or GIF (max. 2MB)
          </Typography>
        </>
      )}
      <input
        type="file"
        id={inputId}
        accept="image/*"
        hidden
        onChange={handleFileSelect}
        aria-label="Upload company logo file"
        aria-describedby="logo-upload-hint"
      />
    </Box>
  );
});

LogoUpload.displayName = 'LogoUpload';

export default LogoUpload;
