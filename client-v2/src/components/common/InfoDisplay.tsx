import React from "react";
import { Alert, AlertTitle, Snackbar, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface InfoDisplayProps {
  message: string | null;
  onClose?: () => void;
  variant?: "inline" | "snackbar";
  autoHideDuration?: number;
  title?: string;
  severity?: "info" | "warning";
  showCloseButton?: boolean;
  sx?: object;
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({
  message,
  onClose,
  variant = "inline",
  autoHideDuration = 5000,
  title,
  severity = "info",
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
          severity={severity}
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
      severity={severity}
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
