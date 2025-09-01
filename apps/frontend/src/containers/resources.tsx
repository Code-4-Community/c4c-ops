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
  IconButton,
} from '@mui/material';
import {
  Visibility as PreviewIcon,
  Close as CloseIcon,
  GetApp as DownloadIcon,
  InsertDriveFile as FileIcon,
  Article as WordIcon,
} from '@mui/icons-material';
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
import FileUploadBox from './fileUploadBox';

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
  const [applicationId, setApplicationId] = useState<number | null>(null);

  const getApplication = async (userId: number) => {
    try {
      const application = await apiClient.getApplication(accessToken, userId);
      setApp(application);
      setApplicationId(application.id);
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
    const blob = new Blob([uint8Array], { type: file.mimetype });
    return URL.createObjectURL(blob);
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

        {!loading && app && (
          <StyledPaper elevation={3}>
            <Typography
              variant="body1"
              fontWeight={'bold'}
              sx={{ color: 'white', mb: 2, fontSize: '1.1rem' }}
            >
              Application Stage:
            </Typography>

            <StageButton>{formatStage(app.stage.toString())}</StageButton>

            <Typography
              variant="body1"
              fontWeight={'bold'}
              sx={{ color: 'white', mb: 2, fontSize: '1.1rem' }}
            >
              Application Status:
            </Typography>

            <StatusButton>{formatReviewStatus(app.review)}</StatusButton>

            <ThankYouText variant="body1" fontWeight={'bold'}>
              Thank you for applying!
            </ThankYouText>

            <DescriptionText variant="body2">
              Our team is working diligently to review your applications. Please
              look out for emails from C4C for updates.
            </DescriptionText>
          </StyledPaper>
        )}

        <Box
          sx={{
            mt: 4,
            backgroundColor: '#3A3A3A',
            border: '1px solid #4A4A4A',
            borderRadius: 2,
            p: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            fontWeight={'bold'}
            gutterBottom
            sx={{
              color: 'white',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Review your materials:
          </Typography>

          {filesLoading ? (
            <Box
              sx={{
                backgroundColor: '#4A4A4A',
                border: '1px solid #5A5A5A',
                borderRadius: 1,
                p: 3,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: 'white', textAlign: 'center' }}
              >
                Loading your files...
              </Typography>
            </Box>
          ) : files.length === 0 ? (
            <Box
              sx={{
                backgroundColor: '#4A4A4A',
                border: '1px solid #5A5A5A',
                borderRadius: 1,
                p: 3,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: 'white', textAlign: 'center' }}
              >
                No files uploaded yet.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {files.map((file) => (
                <Grid item xs={12} md={6} lg={4} key={file.id}>
                  <Card
                    sx={{
                      backgroundColor: '#4A4A4A',
                      border: '1px solid #5A5A5A',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#5A5A5A',
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {file.filename}
                        </Typography>
                      </Box>

                      {file.mimetype === 'application/pdf' &&
                        file.file_data && (
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                width: '100%',
                                height: 300,
                                border: '1px solid #5A5A5A',
                                borderRadius: 1,
                                overflow: 'hidden',
                                backgroundColor: '#1A1A1A',
                              }}
                            >
                              <iframe
                                src={createPdfDataUrl(file)}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title={`Preview of ${file.filename}`}
                                onError={() => {
                                  console.error('PDF preview failed');
                                }}
                              />
                            </Box>
                          </Box>
                        )}

                      {file.mimetype === 'application/msword' && (
                        <Box
                          sx={{
                            p: 2,
                            mb: 2,
                            backgroundColor: '#1A2A4A',
                            border: '1px solid #2196F3',
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <WordIcon sx={{ fontSize: 16, color: '#2196F3' }} />
                            <Typography
                              variant="body2"
                              sx={{ color: '#2196F3', fontWeight: 'bold' }}
                            >
                              Word Document
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ color: '#BBDEFB' }}
                          >
                            Click preview to view options for this document
                          </Typography>
                        </Box>
                      )}

                      {(file.mimetype === 'image/jpeg' ||
                        file.mimetype === 'image/png') &&
                        file.file_data && (
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 200,
                                backgroundColor: '#2A2A2A',
                                borderRadius: 1,
                                border: '1px solid #5A5A5A',
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                component="img"
                                src={createFileDataUrl(file)}
                                alt={file.filename}
                                sx={{
                                  maxWidth: '100%',
                                  maxHeight: 200,
                                  height: 'auto',
                                  objectFit: 'contain',
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML =
                                      '<div style="color: #F44336; text-align: center; padding: 20px;">Failed to load image preview</div>';
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        )}

                      <Button
                        variant="contained"
                        startIcon={<PreviewIcon />}
                        onClick={() => handlePreviewFile(file)}
                        fullWidth
                        sx={{
                          backgroundColor: '#2196F3',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#1976D2',
                          },
                          fontWeight: 'bold',
                        }}
                      >
                        Preview
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {!loading && !app && (
          <StyledPaper elevation={3}>
            <Typography
              variant="body1"
              sx={{ color: 'white', textAlign: 'center' }}
            >
              No application found.
            </Typography>
          </StyledPaper>
        )}

        {loading && (
          <StyledPaper elevation={3}>
            <Typography
              variant="body1"
              sx={{ color: 'white', textAlign: 'center' }}
            >
              Loading application details...
            </Typography>
          </StyledPaper>
        )}
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
            maxHeight: 'calc(100vh - 120px)',
            maxWidth: 'calc(100vw - 60px)',
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
            borderBottom: '1px solid #4A4A4A',
            backgroundColor: '#3A3A3A',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            {previewFile?.filename}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => previewFile && downloadFile(previewFile)}
              sx={{
                mr: 1,
                color: 'white',
                borderColor: '#4A4A4A',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: '#4A4A4A',
                },
              }}
            >
              Download
            </Button>
            <IconButton
              onClick={handleClosePreview}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4A4A4A',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <DialogContent
          sx={{ p: 0, overflow: 'hidden', backgroundColor: '#2A2A2A', pb: 0 }}
        >
          {renderPreviewContent()}
        </DialogContent>
      </Dialog>
      {!loading && app && String(app.stage) === 'PM_CHALLENGE' && (
        <FileUploadBox
          accessToken={accessToken}
          applicationId={applicationId}
        />
      )}
    </Container>
  );
};

export default Resources;
