import React, { createContext, useCallback, useContext, useState } from "react";
import Loader from "../components/ui/Loader";

type LoaderContextType = {
  isLoading: boolean;
  message?: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const showLoader = useCallback((msg?: string) => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setMessage(undefined);
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading, message, showLoader, hideLoader }}>
      {isLoading && <Loader message={message} />}
      {children}
    </LoaderContext.Provider>
  );
};

export function useLoader(): LoaderContextType {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
}