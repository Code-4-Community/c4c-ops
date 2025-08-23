import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
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

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      setToastMessage(`Selected: ${event.dataTransfer.files[0].name}`);
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
        setToastOpen(true);
        return;
      }

      await apiClient.uploadFile(accessToken, applicationId, selectedFile);

      setToastMessage(`Uploaded: ${selectedFile.name}`);
      setSelectedFile(null); // File is no longer staged after upload
    } catch (error: any) {
      console.error('Upload failed:', error);
      setToastMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#1e1e1e',
        borderRadius: 2,
        p: 3,
        mt: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
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
              backgroundColor: '#2a2a2a',
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
    </Box>
  );
};

export default FileUploadBox;
