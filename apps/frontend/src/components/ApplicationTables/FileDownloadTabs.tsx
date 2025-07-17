import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import apiClient, { FileType } from '@api/apiClient';

interface FileDownloadTabsProps {
  applicantId: number;
  applicantName: string;
  accessToken: string;
}

const fileTypeConfig = {
  [FileType.OVERVIEW]: {
    label: 'Overview',
    icon: <DescriptionIcon />,
    color: '#1976d2',
  },
  [FileType.APPLICATION]: {
    label: 'Application',
    icon: <AssignmentIcon />,
    color: '#388e3c',
  },
  [FileType.MATERIALS]: {
    label: 'Materials',
    icon: <FolderIcon />,
    color: '#f57c00',
  },
  [FileType.INTERVIEW_NOTES]: {
    label: 'Interview Notes',
    icon: <NotesIcon />,
    color: '#7b1fa2',
  },
};

export const FileDownloadTabs: React.FC<FileDownloadTabsProps> = ({
  applicantId,
  applicantName,
  accessToken,
}) => {
  const [availableTypes, setAvailableTypes] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState<FileType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const fetchAvailableTypes = async () => {
    try {
      setLoading(true);
      const types = await apiClient.getAvailableFileTypes(
        accessToken,
        applicantId,
      );
      setAvailableTypes(types);
    } catch (error) {
      console.error('Error fetching available file types:', error);
      setError('Failed to load available file types');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableTypes();
  }, [accessToken, applicantId]);

  const handleDownload = async (fileType: FileType) => {
    if (!availableTypes.includes(fileType)) {
      setError(
        `No ${fileTypeConfig[
          fileType
        ].label.toLowerCase()} file uploaded for this applicant`,
      );
      setShowError(true);
      return;
    }

    try {
      setDownloadingType(fileType);
      await apiClient.downloadFile(accessToken, applicantId, fileType);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(
        `Failed to download ${fileTypeConfig[
          fileType
        ].label.toLowerCase()} file`,
      );
      setShowError(true);
    } finally {
      setDownloadingType(null);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
    setError(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Download Files for {applicantName}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Object.entries(fileTypeConfig).map(([fileType, config]) => {
          const isAvailable = availableTypes.includes(fileType as FileType);
          const isDownloading = downloadingType === fileType;

          return (
            <Tooltip
              key={fileType}
              title={
                isAvailable
                  ? `Download ${config.label}`
                  : `${config.label} not available yet`
              }
              arrow
            >
              <span>
                <Button
                  variant={isAvailable ? 'contained' : 'outlined'}
                  disabled={!isAvailable || isDownloading}
                  onClick={() => handleDownload(fileType as FileType)}
                  startIcon={
                    isDownloading ? <CircularProgress size={16} /> : config.icon
                  }
                  endIcon={
                    isAvailable && !isDownloading ? <DownloadIcon /> : undefined
                  }
                  sx={{
                    backgroundColor: isAvailable ? config.color : 'transparent',
                    borderColor: config.color,
                    color: isAvailable ? 'white' : config.color,
                    '&:hover': {
                      backgroundColor: isAvailable
                        ? config.color
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                    '&:disabled': {
                      backgroundColor: isAvailable
                        ? 'rgba(0, 0, 0, 0.12)'
                        : 'transparent',
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                    minWidth: 140,
                    height: 40,
                  }}
                >
                  {isDownloading ? 'Downloading...' : config.label}
                </Button>
              </span>
            </Tooltip>
          );
        })}
      </Box>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
