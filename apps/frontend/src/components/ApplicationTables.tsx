import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Container,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import apiClient from '@api/apiClient';
import { DoneOutline } from '@mui/icons-material';
enum ApplicationStage {
  RESUME = 'RESUME',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  TECHNICAL_CHALLENGE = 'TECHNICAL_CHALLENGE',
  PM_CHALLENGE = 'PM_CHALLENGE',
}

export enum ApplicationStep {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
}

enum Position {
  DEVELOPER = 'DEVELOPER',
  PM = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
}

export type applicationRow = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  stage: ApplicationStage;
  step: ApplicationStep;
  position: Position;
  createdAt: string;
  meanRatingAllStages: number;
  meanRatingSingleStages: number;
};

type Response = {
  question: string;
  answer: string;
};

enum Semester {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

export type Application = {
  id: number;
  createdAt: Date;
  year: number;
  semester: Semester;
  position: Position;
  stage: ApplicationStage;
  step: ApplicationStep;
  response: Response[];
  numApps: number;
};

const getCurrentSemester = (): Semester => {
  const month: number = new Date().getMonth();
  if (month >= 1 && month <= 7) {
    return Semester.FALL; // We will be recruiting for the fall semester during Feb - Aug
  }
  return Semester.SPRING; // We will be recruiting for the spring semester during Sep - Jan
};

const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export function ApplicationTable() {
  const isPageRendered = useRef<boolean>(false);

  const [data, setData] = useState<applicationRow[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);
  const [selectedUser, setSelectedUser] = useState<applicationRow | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(0);

  const handleOpenReviewModal = () => {
    setOpenReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
    setReviewComment('');
  };

  const handleReviewSubmit = () => {
    handleCloseReviewModal();
  };

  const fetchData = async () => {
    const data = await apiClient.getAllApplications(accessToken);
    // Each application needs an id for the DataGrid to work
    if (data) {
      data.forEach((row, index) => {
        row.id = index;
      });
      setData(data);
    }
  };

  const getApplication = async (userId: number) => {
    const application = await apiClient.getApplication(accessToken, userId);
    setSelectedApplication(application);
  };

  const getFullName = async () => {
    setFullName(await apiClient.getFullName(accessToken));
  };

  useEffect(() => {
    // Access token comes from OAuth redirect uri https://frontend.com/#access_token=access_token
    // const hash = window.location.hash;
    // const accessTokenMatch = hash.match(/access_token=([^&]*)/);
    // if (accessTokenMatch) {
    setAccessToken(
      'eyJraWQiOiJNR2hHMnNhS1RDb2hid2d1Y1F4aGZVcFBJYWJob3hZTGxIeVhGdlRYSjV3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1ZTQwZWYwYi02Yzc0LTRkM2MtYjUzOC0wOWYzNTUxYWJjMDgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9oVHRaNU41WlYiLCJjbGllbnRfaWQiOiI0YzViOG02dG5vOWZ2bGptc2VxZ21rODJmdiIsIm9yaWdpbl9qdGkiOiI4ZmQ0NzdiYy05NDY0LTQwYzMtOTZkMC1jZTlhNjQ2ZTllYzkiLCJldmVudF9pZCI6ImRhOTVjMDAyLTVmMjItNDI4Ni1hZjU2LWJkY2Y1NmViMzFhOSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MzA4MTc1MTgsImV4cCI6MTczMDgyMTExOCwiaWF0IjoxNzMwODE3NTE4LCJqdGkiOiI1MDZlOTg3Ni1mMTI4LTQ3YTYtYWQ4MC0wMmRiY2MxOThhNzEiLCJ1c2VybmFtZSI6IjVlNDBlZjBiLTZjNzQtNGQzYy1iNTM4LTA5ZjM1NTFhYmMwOCJ9.Z4e7xWyiWCChNfryq2I_tyDZ-xk-Wd3_cY2ajkcBpkvbwQl_xwb9O7Ud9lr9091EOqTRVN5pJFRvrtVd8bBPU6_ea4dHhYHz1xYw7XY9PG3jgE-5yP8-GazKhcOLW7W5hlcbMsehyWxVFCjVfBj2lxGiE23xqUKMxBK8ij4VaXZ0ZT5kbdw8Q70ce8RtwIjcVGaMU7l9gna-pMUT5X_0p01Q1p58bP2wc1_X41aaUs8kNd3ByDVTkIV3bPTU3_45AEVQ0vFSdcLz4gRLmDVl_Ss5_VVvzhGTMUHiT8ujK05jSirA9Ce8V4VlgFgWo04K9jv1d7m84M9RbLo91drLVg',
    );
    // }
    isPageRendered.current = false;
  }, []);

  useEffect(() => {
    if (isPageRendered.current) {
      fetchData();
      getFullName();
    }
    isPageRendered.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (rowSelection.length > 0) {
      setSelectedUser(data[rowSelection[0] as number]);
    }
  }, [rowSelection, data]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" mb={1}>
        Welcome back, {fullName ? fullName : 'User'}
      </Typography>
      <Typography variant="h6" mb={1}>
        Current Recruitment Cycle: {getCurrentSemester()} {getCurrentYear()}
      </Typography>
      <Typography variant="body1" mb={3}>
        Assigned For Review: Jane Smith, John Doe (Complete by 5/1/2024)
      </Typography>
      <DataGrid
        rows={data}
        columns={[
          {
            field: 'firstName',
            headerName: 'First Name',
            width: 150,
          },
          {
            field: 'lastName',
            headerName: 'Last Name',
            width: 150,
          },
          {
            field: 'stage',
            headerName: 'Stage',
            width: 125,
          },
          {
            field: 'step',
            headerName: 'Status',
            width: 125,
          },
          {
            field: 'position',
            headerName: 'Position',
            width: 150,
          },
          {
            field: 'createdAt',
            headerName: 'Date',
            width: 150,
          },
          {
            field: 'meanRatingAllStages',
            headerName: 'Rating All Stages',
            width: 150,
          },
          {
            field: 'meanRatingSingleStages',
            headerName: 'Rating Single Stage',
            width: 150,
          },
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelection(newRowSelectionModel);
          getApplication(data[newRowSelectionModel[0] as number].userId);
        }}
        rowSelectionModel={rowSelection}
      />

      <Typography variant="h6" mt={3}>
        {selectedUser
          ? `Selected Applicant: ${selectedUser.firstName} ${selectedUser.lastName}`
          : 'No Applicant Selected'}
      </Typography>
      {selectedApplication ? (
        <>
          <Typography variant="h6" mt={2}>
            Application Details
          </Typography>
          <Stack spacing={2} direction="row" mt={1}>
            <Typography variant="body1">
              Year: {selectedApplication.year}
            </Typography>
            <Typography variant="body1">
              Semester: {selectedApplication.semester}
            </Typography>
            <Typography variant="body1">
              Position: {selectedApplication.position}
            </Typography>
            <Typography variant="body1">
              Stage: {selectedApplication.stage}
            </Typography>
            <Typography variant="body1">
              Status: {selectedApplication.step}
            </Typography>
            <Typography variant="body1">
              Applications: {selectedApplication.numApps}
            </Typography>
          </Stack>
          <Typography variant="body1" mt={1}>
            Application Responses
          </Typography>
          <List disablePadding dense>
            {selectedApplication.response.map((response, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <DoneOutline />
                </ListItemIcon>
                <ListItemText
                  primary={`Question: ${response.question}`}
                  secondary={`Answer: ${response.answer}`}
                />
              </ListItem>
            ))}
          </List>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
            }}
          >
            <Typography variant="body1">Reviews: None</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpenReviewModal}
            >
              Start Review
            </Button>
          </Stack>
          <Dialog open={openReviewModal} onClose={handleCloseReviewModal}>
            <DialogTitle>Write Review</DialogTitle>
            <DialogContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Typography variant="body1">Rating:</Typography>
                <Rating
                  name="review-rating"
                  value={reviewRating}
                  onChange={(_, value) => setReviewRating(value || 0)}
                  precision={1}
                />
              </Stack>
              <TextField
                autoFocus
                margin="dense"
                id="review"
                label="Review Comments"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReviewModal}>Cancel</Button>
              <Button onClick={handleReviewSubmit}>Submit Review</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </Container>
  );
}
