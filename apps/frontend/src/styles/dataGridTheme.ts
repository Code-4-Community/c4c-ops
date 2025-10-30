import { SxProps, Theme } from '@mui/material';

/**
 * Shared styling configuration for MUI DataGrid components.
 * Provides consistent dark theme styling across all application tables.
 */
export const dataGridStyles: SxProps<Theme> = {
  border: 'none',
  boxShadow: 'none',
  backgroundColor: '#1E1E1E',
  color: 'white',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1E1E1E',
    borderBottom: 'none',
    color: '#BDBDBD',
    fontSize: '0.85rem',
    boxShadow: 'none',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: 'none',
    boxShadow: 'none',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: 'none',
    borderRight: 'none',
    color: 'white',
    boxShadow: 'none',
    outline: 'none',
  },
  '& .MuiDataGrid-row': {
    borderBottom: 'none',
    boxShadow: 'none',
  },
  '& .MuiDataGrid-row.Mui-selected': {
    backgroundColor: 'purple',
    '&:hover': {
      backgroundColor: 'purple',
    },
  },
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#1E1E1E',
    borderTop: 'none',
    color: '#BDBDBD',
    boxShadow: 'none',
  },
  '& .MuiDataGrid-toolbarContainer': {
    borderBottom: 'none',
    boxShadow: 'none',
  },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
    outline: 'none',
    border: 'none',
    boxShadow: 'none',
  },
};

/**
 * Default pagination configuration for DataGrid.
 */
export const defaultPaginationModel = {
  page: 0,
  pageSize: 5,
};

/**
 * Default page size options for DataGrid pagination.
 */
export const defaultPageSizeOptions = [5, 10];
