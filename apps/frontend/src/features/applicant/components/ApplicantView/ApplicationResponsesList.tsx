import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import { DoneOutline } from '@mui/icons-material';
import { Response } from '@sharedTypes/types/application.types';

interface ApplicationResponsesListProps {
  responses: Response[];
}

export const ApplicationResponsesList = ({
  responses,
}: ApplicationResponsesListProps) => {
  if (!responses || responses.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Application Responses
      </Typography>
      <List disablePadding dense>
        {responses.map((response, index) => (
          <ListItem
            key={index}
            sx={{
              alignItems: 'flex-start',
              backgroundColor: '#1e1e1e',
              borderRadius: 1,
              mb: 1,
              padding: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', mr: 2, mt: 0.5 }}>
              <DoneOutline sx={{ color: '#4CAF50' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ color: '#999', mb: 0.5 }}>
                  {response.question}
                </Typography>
              }
              secondary={
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {response.answer}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
