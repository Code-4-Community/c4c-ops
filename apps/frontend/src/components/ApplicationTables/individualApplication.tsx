import {
  Typography,
  Stack,
  List,
  ListItem,
  Button,
  TextField,
} from '@mui/material';
import { Application, ApplicationRow } from '../types';
import React from 'react';
import {
  MailOutline,
  DescriptionOutlined,
  NoteAltOutlined,
} from '@mui/icons-material';

type IndividualApplicationDetailsProps = {
  selectedApplication: Application;
  selectedUserRow: ApplicationRow;
  accessToken: string;
};

const IndividualApplicationDetails: React.FC<
  IndividualApplicationDetailsProps
> = ({ selectedApplication, selectedUserRow, accessToken }) => (
  <>
    <Stack direction="row" spacing={2} mt={2}>
      <Stack direction="column" spacing={2} mt={2}>
        <Stack direction="row" alignItems="center" spacing={2} mt={4} mb={8}>
          <img
            src="/c4clogo.png"
            alt="C4C Logo"
            style={{ width: 50, height: 40 }}
          />
          <Typography
            variant="h4"
            mt={3}
            sx={{ fontWeight: 'bold', color: 'white' }}
          >
            {selectedUserRow.firstName} {selectedUserRow.lastName} |{' '}
            {selectedUserRow.position}
          </Typography>
        </Stack>
        <Typography variant="subtitle1" mt={2}>
          {/* Make this with the correct links/information */}
          <MailOutline /> Email <NoteAltOutlined /> Overview{' '}
          <DescriptionOutlined /> Application
        </Typography>
        <Stack direction="column" spacing={2} mt={2}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1">Application Stage: </Typography>
            <Button variant="contained" size="small">
              {selectedApplication.stage}
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1">Assigned To: </Typography>
            {/* TODO: Give this button assigned to functionality (account for authorization somehow) */}
            <Button variant="contained" size="small">
              ASSIGNED TO INFORMATION HERE
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="body1">Review Step: </Typography>
            <Button variant="contained" size="small">
              {selectedApplication.step}
            </Button>
          </Stack>
        </Stack>
        <Typography variant="h5" mt={1}>
          Application Response
        </Typography>
        <List disablePadding dense>
          {selectedApplication.response.map((response, index) => (
            <ListItem key={index}>
              <Stack direction="column" spacing={1}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {index + 1}. {response.question}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    ml: 6,
                    mt: 0.5,
                  }}
                >
                  {response.answer}
                </Typography>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Stack>
      <Stack direction="column" spacing={2} mt={2}>
        <Typography variant="h5" mt={1} mb={2}>
          Recruiter Review
        </Typography>
        <Stack direction="column" spacing={2}>
          <Typography variant="body1">Rating:</Typography>
          <Button variant="contained" size="small">
            {/* {selectedApplication.rating} */}
            {/* TODO: Give this button rating modal functionality */}
            Rating Here
          </Button>
        </Stack>
        <Stack direction="column" spacing={2}>
          <Typography variant="body1">Final Recommendation:</Typography>
          <Button variant="contained" size="small">
            {/* {selectedApplication.decision} */}
            {/* TODO: Give this button decision modal functionality */}
            Decision Here
          </Button>
        </Stack>
        <Stack direction="column" spacing={2}>
          <Typography variant="body1">Comments:</Typography>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={4}
          />
        </Stack>
        {/* Add a horizontal bar here */}
        <Stack>
          Reviews:
          {selectedApplication.reviews.map((review, index) => {
            return (
              <Stack key={index} direction="column" spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1">Name:</Typography>
                  <Typography variant="body1">Time/Date</Typography>
                </Stack>
                <Typography variant="body1">
                  {review.rating}/{review.stage}
                </Typography>
                <Typography variant="body1">
                  comment: {review.content}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  </>
);

export default IndividualApplicationDetails;
