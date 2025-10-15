import React from "react";
import { Alert, AlertTitle, Snackbar, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface SuccessDisplayProps {
  message: string | null;
  onClose?: () => void;
  variant?: "inline" | "snackbar";
  autoHideDuration?: number;
  title?: string;
  showCloseButton?: boolean;
  sx?: object;
}

export const SuccessDisplay: React.FC<SuccessDisplayProps> = ({
  message,
  onClose,
  variant = "inline",
  autoHideDuration = 4000,
  title,
  showCloseButton = true,
  sx = {},
}) => {
  if (!message) return null;

  // Snackbar variant (toast notification)
  if (variant === "snackbar") {
    return (
      <Snackbar
        open={!!message}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={showCloseButton ? onClose : undefined}
          severity="success"
          sx={{ width: "100%" }}
          action={
            showCloseButton && onClose ? (
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={onClose}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            ) : undefined
          }
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {message}
        </Alert>
      </Snackbar>
    );
  }

  // Inline variant (embedded in page)
  return (
    <Alert
      severity="success"
      onClose={showCloseButton ? onClose : undefined}
      sx={{
        mb: 2,
        borderRadius: 1,
        ...sx,
      }}
      action={
        showCloseButton && onClose ? (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        ) : undefined
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};
