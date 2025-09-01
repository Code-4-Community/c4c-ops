import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import apiClient from '@api/apiClient';

interface FileUploadBoxProps {
  accessToken: string;
  applicationId: number | null;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  accessToken,
  applicationId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<
    'success' | 'error' | 'info'
  >('info');

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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      setToastMessage(`Selected: ${event.dataTransfer.files[0].name}`);
      setToastSeverity('info');
      setToastOpen(true);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);

      if (!applicationId) {
        setToastMessage('Application ID not found. Cannot upload file.');
        setToastSeverity('error');
        setToastOpen(true);
        return;
      }

      await apiClient.uploadFile(accessToken, applicationId, selectedFile);

      setToastMessage(`Uploaded: ${selectedFile.name}`);
      setToastSeverity('success');
      setSelectedFile(null); // File is no longer staged after upload
      setToastOpen(true);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setToastSeverity('error');
      setToastMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#403f3f',
        borderRadius: 2,
        p: 3,
        mt: 4,
        textAlign: 'center',
        width: 717,
      }}
    >
      <Typography
        variant="body1"
        sx={{ color: 'white', mb: 2, textAlign: 'left' }}
      >
        Drop and upload selected files
      </Typography>

      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          border: '1px dashed #999',
          borderRadius: 1,
          p: 3,
          cursor: 'pointer',
          '&:hover': { borderColor: '#d81b60' },
        }}
      >
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button
            component="span"
            sx={{
              color: 'white',
              backgroundColor: '#403f3f',
              border: '1px solid #555',
              '&:hover': { backgroundColor: '#d81b60', borderColor: '#d81b60' },
            }}
          >
            Upload from your computer
          </Button>
        </label>
      </Box>

      {selectedFile && (
        <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
          Selected: {selectedFile.name}
        </Typography>
      )}

      {selectedFile && (
        <Button
          variant="contained"
          disabled={uploading}
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#d81b60',
            '&:hover': { backgroundColor: '#ad1457' },
            mt: 2,
          }}
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </Button>
      )}

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
    </Box>
  );
};

export default FileUploadBox;
