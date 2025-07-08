import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ErrorDisplay, SuccessDisplay, InfoDisplay } from "./index";
import type { ApiError } from "@/types/apiError";

interface NotificationState {
  error: ApiError | null;
  success: string | null;
  info: string | null;
  infoSeverity: "info" | "warning";
}

interface NotificationContextType {
  // Error methods
  showError: (error: ApiError) => void;
  clearError: () => void;

  // Success methods
  showSuccess: (message: string) => void;
  clearSuccess: () => void;

  // Info methods
  showInfo: (message: string, severity?: "info" | "warning") => void;
  clearInfo: () => void;

  // Clear all
  clearAll: () => void;

  // State
  notification: NotificationState;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
  variant?: "inline" | "snackbar";
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  variant = "snackbar",
}) => {
  const [notification, setNotification] = useState<NotificationState>({
    error: null,
    success: null,
    info: null,
    infoSeverity: "info",
  });

  const showError = (error: ApiError) => {
    setNotification((prev) => ({ ...prev, error, success: null, info: null }));
  };

  const clearError = () => {
    setNotification((prev) => ({ ...prev, error: null }));
  };

  const showSuccess = (message: string) => {
    setNotification((prev) => ({
      ...prev,
      success: message,
      error: null,
      info: null,
    }));
  };

  const clearSuccess = () => {
    setNotification((prev) => ({ ...prev, success: null }));
  };

  const showInfo = (message: string, severity: "info" | "warning" = "info") => {
    setNotification((prev) => ({
      ...prev,
      info: message,
      infoSeverity: severity,
      error: null,
      success: null,
    }));
  };

  const clearInfo = () => {
    setNotification((prev) => ({ ...prev, info: null }));
  };

  const clearAll = () => {
    setNotification({
      error: null,
      success: null,
      info: null,
      infoSeverity: "info",
    });
  };

  const contextValue: NotificationContextType = {
    showError,
    clearError,
    showSuccess,
    clearSuccess,
    showInfo,
    clearInfo,
    clearAll,
    notification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Global Notifications */}
      <ErrorDisplay
        error={notification.error}
        onClose={clearError}
        variant={variant}
      />

      <SuccessDisplay
        message={notification.success}
        onClose={clearSuccess}
        variant={variant}
      />

      <InfoDisplay
        message={notification.info}
        onClose={clearInfo}
        variant={variant}
        severity={notification.infoSeverity}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
