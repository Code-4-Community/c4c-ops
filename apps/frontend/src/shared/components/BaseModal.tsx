import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Props for the BaseModal component.
 */
export interface BaseModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Optional footer actions (if not provided, default Cancel/Submit buttons shown) */
  actions?: ReactNode;
  /** Text for the submit button (default: "Submit") */
  submitLabel?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Callback when submit button is clicked */
  onSubmit?: () => void;
  /** Whether submit button is disabled */
  submitDisabled?: boolean;
  /** Maximum width of the modal */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show close icon in title */
  showCloseIcon?: boolean;
}

/**
 * Base modal component that provides consistent styling and behavior.
 * Used as foundation for all modal dialogs in the application.
 *
 * @example
 * ```tsx
 * <BaseModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Review Application"
 *   onSubmit={handleSubmit}
 * >
 *   <TextField label="Comments" />
 * </BaseModal>
 * ```
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onSubmit,
  submitDisabled = false,
  maxWidth = 'sm',
  showCloseIcon = true,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {title}
        {showCloseIcon && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>{children}</form>
      </DialogContent>
      <DialogActions>
        {actions || (
          <>
            <Button onClick={onClose} color="inherit">
              {cancelLabel}
            </Button>
            <Button
              onClick={onSubmit}
              variant="contained"
              disabled={submitDisabled}
            >
              {submitLabel}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
