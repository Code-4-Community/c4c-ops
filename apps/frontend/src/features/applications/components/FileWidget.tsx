import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  UploadFile,
  Download,
  Description,
  CheckCircle,
} from '@mui/icons-material';
import { FilePurpose } from '@sharedTypes/types/file-upload.types';
import apiClient from '@api/apiClient';

interface FileWidgetProps {
  filePurpose: FilePurpose;
  fileData?: {
    id: number;
    filename: string;
    size: number;
    mimetype: string;
  } | null;
  applicationId: number;
  accessToken: string;
  onFileUploaded?: () => void;
}

const ACCENT = '#9B6CFF';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const FileWidget: React.FC<FileWidgetProps> = ({
  filePurpose,
  fileData,
  applicationId,
  accessToken,
  onFileUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<
    'success' | 'error' | 'info'
  >('info');

  const displayName =
    filePurpose === FilePurpose.RESUME ? 'Resume' : 'PM Challenge';

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setToastMessage(`Selected: ${event.target.files[0].name}`);
      setToastSeverity('info');
      setToastOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);

      await apiClient.uploadFile(
        accessToken,
        applicationId,
        selectedFile,
        filePurpose,
      );

      setToastMessage(`${displayName} uploaded successfully!`);
      setToastSeverity('success');
      setSelectedFile(null);
      setToastOpen(true);

      // Trigger refresh callback
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setToastSeverity('error');
      setToastMessage('Upload failed. Please try again.');
      setToastOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileData) return;
    try {
      setDownloading(true);

      const blob = await apiClient.downloadFile(accessToken, fileData.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMessage('File downloaded successfully!');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (error: any) {
      console.error('Download failed:', error);
      setToastSeverity('error');
      setToastMessage('Download failed. Please try again.');
      setToastOpen(true);
    } finally {
      setDownloading(false);
    }
  };

  // Empty State - No file uploaded
  if (!fileData) {
    return (
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${alpha(ACCENT, 0.35)}`,
          backgroundColor: 'transparent',
          p: 2.5,
          borderRadius: 1.5,
        }}
      >
        <Stack direction="column" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <UploadFile sx={{ color: alpha(ACCENT, 0.7) }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}
            >
              {displayName}
            </Typography>
          </Stack>

          <Box
            sx={{
              border: `2px dashed ${alpha(ACCENT, 0.4)}`,
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              backgroundColor: alpha(ACCENT, 0.05),
            }}
          >
            <Description
              sx={{ fontSize: 48, color: alpha(ACCENT, 0.5), mb: 1 }}
            />
            <Typography
              variant="body2"
              sx={{ color: alpha('#fff', 0.7), mb: 2 }}
            >
              No file uploaded yet
            </Typography>

            <input
              type="file"
              id={`file-upload-${filePurpose}`}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,image/*"
            />
            <label htmlFor={`file-upload-${filePurpose}`}>
              <Button
                component="span"
                variant="outlined"
                size="small"
                startIcon={<UploadFile />}
                sx={{
                  color: '#fff',
                  borderColor: alpha(ACCENT, 0.6),
                  '&:hover': {
                    borderColor: ACCENT,
                    backgroundColor: alpha(ACCENT, 0.1),
                  },
                }}
              >
                Choose File
              </Button>
            </label>
          </Box>

          {selectedFile && (
            <Box
              sx={{
                backgroundColor: alpha(ACCENT, 0.1),
                borderRadius: 1,
                p: 1.5,
                border: `1px solid ${alpha(ACCENT, 0.3)}`,
              }}
            >
              <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha('#fff', 0.7), display: 'block', mb: 1.5 }}
              >
                Size: {formatFileSize(selectedFile.size)}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="small"
                disabled={uploading}
                onClick={handleUpload}
                sx={{
                  bgcolor: ACCENT,
                  '&:hover': { bgcolor: alpha(ACCENT, 0.85) },
                }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </Button>
            </Box>
          )}
        </Stack>

        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleToastClose}
            severity={toastSeverity}
            sx={{ width: '100%' }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Card>
    );
  }

  // Filled State - File uploaded
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(ACCENT, 0.35)}`,
        backgroundColor: 'transparent',
        p: 2.5,
        borderRadius: 1.5,
      }}
    >
      <Stack direction="column" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CheckCircle sx={{ color: '#4caf50' }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}
          >
            {displayName}
          </Typography>
        </Stack>

        <Box
          sx={{
            backgroundColor: alpha(ACCENT, 0.12),
            borderRadius: 1,
            p: 2,
            border: `1px solid ${alpha(ACCENT, 0.3)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Description sx={{ fontSize: 40, color: alpha(ACCENT, 0.8) }} />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{ color: '#fff', fontWeight: 500, mb: 0.5 }}
              >
                {fileData.filename}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
                {formatFileSize(fileData.size)} • {fileData.mimetype}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={downloading ? null : <Download />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{
                bgcolor: ACCENT,
                '&:hover': { bgcolor: alpha(ACCENT, 0.85) },
              }}
            >
              {downloading ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Downloading...
                </>
              ) : (
                'Download'
              )}
            </Button>

            {/* Option to replace file */}
            <input
              type="file"
              id={`file-replace-${filePurpose}`}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,image/*"
            />
            <label htmlFor={`file-replace-${filePurpose}`}>
              <Button
                component="span"
                variant="outlined"
                size="small"
                sx={{
                  color: '#fff',
                  borderColor: alpha(ACCENT, 0.6),
                  '&:hover': {
                    borderColor: ACCENT,
                    backgroundColor: alpha(ACCENT, 0.1),
                  },
                }}
              >
                Replace
              </Button>
            </label>
          </Stack>

          {selectedFile && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(ACCENT, 0.2)}`,
              }}
            >
              <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                New file: {selectedFile.name}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="small"
                disabled={uploading}
                onClick={handleUpload}
                sx={{
                  bgcolor: ACCENT,
                  '&:hover': { bgcolor: alpha(ACCENT, 0.85) },
                }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  'Upload Replacement'
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Stack>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default FileWidget;
