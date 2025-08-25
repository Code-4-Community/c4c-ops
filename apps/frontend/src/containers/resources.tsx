import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import apiClient from '@api/apiClient';
import useLoginContext from '@components/LoginPage/useLoginContext';
import { Application } from '@components/types';
import {
  StyledPaper,
  StageButton,
  StatusButton,
  ThankYouText,
  DescriptionText,
} from '../components/ApplicantView/ApplicantStatus/items';
import {
  Visibility as PreviewIcon,
  Close as CloseIcon,
  GetApp as DownloadIcon,
  Description as FileTextIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Folder as FolderIcon,
  Article as WordIcon,
} from '@mui/icons-material';

interface FileUpload {
  id: number;
  filename: string;
  mimetype: string;
  size: number;
  file_data?: {
    type: string;
    data: number[];
  };
  applicationId: number;
}

const Resources: React.FC = () => {
  const { token: accessToken } = useLoginContext();
  const [app, setApp] = useState<Application | null>(null);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileUpload | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getApplication = async (userId: number) => {
    try {
      const application = await apiClient.getApplication(accessToken, userId);
      setApp(application);
      return application;
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to fetch application details.');
      return null;
    }
  };

  const fetchUserFiles = async (userId: number) => {
    setFilesLoading(true);
    try {
      const response = await apiClient.getFiles(userId, accessToken);
      if (response && response.files) {
        setFiles(response.files);
      } else {
        console.error('No files in response:', response);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const data = await apiClient.getAllApplications(accessToken);
      if (data && data.length > 0) {
        const application = await getApplication(data[0].userId);
        if (application) {
          setApp(application);
          await fetchUserFiles(data[0].userId);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const createFileDataUrl = (file: FileUpload): string => {
    if (!file.file_data?.data) return '';
    const uint8Array = new Uint8Array(file.file_data.data);
    const blob = new Blob([uint8Array], { type: file.mimetype });
    return URL.createObjectURL(blob);
  };

  const createPdfDataUrl = (file: FileUpload): string => {
    if (!file.file_data?.data) return '';
    const uint8Array = new Uint8Array(file.file_data.data);
    const base64String = btoa(String.fromCharCode(...uint8Array));
    return `data:${file.mimetype};base64,${base64String}`;
  };

  const downloadFile = (file: FileUpload) => {
    try {
      if (!file.file_data?.data) {
        alert('File data not available');
        return;
      }

      const url = createFileDataUrl(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading file: ' + (err as Error).message);
    }
  };

  const handlePreviewFile = (file: FileUpload) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const formatStage = (stage: string) => {
    switch (stage) {
      case 'PM_CHALLENGE':
        return 'PM Challenge';
      case 'INTERVIEW':
        return 'Interview';
      case 'FINAL_REVIEW':
        return 'Final Review';
      default:
        return stage
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const formatReviewStatus = (review: string) => {
    switch (review) {
      case 'IN_REVIEW':
        return 'In Review';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      default:
        return review
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const renderPreviewContent = () => {
    if (!previewFile || !previewFile.file_data) return null;

    if (previewFile.mimetype === 'application/pdf') {
      return (
        <Box sx={{ width: '100%', height: '80vh' }}>
          <iframe
            src={createPdfDataUrl(previewFile)}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={`Preview of ${previewFile.filename}`}
          />
        </Box>
      );
    }

    if (
      previewFile.mimetype === 'image/jpeg' ||
      previewFile.mimetype === 'image/png'
    ) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '80vh',
            backgroundColor: '#000',
          }}
        >
          <Box
            component="img"
            src={createFileDataUrl(previewFile)}
            alt={previewFile.filename}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      );
    }

    if (previewFile.mimetype === 'application/msword') {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: 3,
          }}
        >
          <WordIcon sx={{ fontSize: 80, color: '#2196F3' }} />
          <Typography variant="h5" sx={{ color: 'white', textAlign: 'center' }}>
            Word Document Preview Not Available
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#B0B0B0', textAlign: 'center', mb: 2 }}
          >
            This file type cannot be previewed in the browser.
            <br />
            Please download the file to view its contents.
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => downloadFile(previewFile)}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45A049' },
              px: 3,
              py: 1.5,
            }}
          >
            Download File
          </Button>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: 3,
        }}
      >
        <FileIcon sx={{ fontSize: 80, color: '#B0B0B0' }} />
        <Typography variant="h5" sx={{ color: 'white', textAlign: 'center' }}>
          Preview Not Available
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#B0B0B0', textAlign: 'center', mb: 2 }}
        >
          This file type cannot be previewed in the browser.
          <br />
          Please download the file to view its contents.
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => downloadFile(previewFile)}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#45A049' },
            px: 3,
            py: 1.5,
          }}
        >
          Download File
        </Button>
      </Box>
    );
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 3, backgroundColor: '#2A2A2A', minHeight: '100vh' }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: 'white', mb: 4 }}
        >
          Resources
        </Typography>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
          '& .MuiDialog-paper': {
            backgroundColor: '#2A2A2A',
            margin: '20px',
            maxHeight: 'calc(100vh - 40px)',
            maxWidth: 'calc(100vw - 40px)',
          },
        }}
        PaperProps={{
          sx: {
            width: 'calc(100vw - 40px)',
            height: 'calc(100vh - 40px)',
            maxWidth: 'none',
            maxHeight: 'none',
            backgroundColor: '#2A2A2A',
            color: 'white',
            '& .MuiDialogContent-root': {
              backgroundColor: '#2A2A2A',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
            {previewFile?.filename}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => previewFile && downloadFile(previewFile)}
              sx={{ mr: 1 }}
            >
              Download
            </Button>
            <IconButton onClick={handleClosePreview} sx={{ color: '#666' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <DialogContent
          sx={{ p: 0, overflow: 'hidden', backgroundColor: '#2A2A2A' }}
        >
          {renderPreviewContent()}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Resources;
