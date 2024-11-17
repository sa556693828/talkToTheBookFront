import { useState, useCallback } from "react";

interface StreamOptions {
  onMessage: (content: string) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

export const useBookChat = () => {
  return {
    isStreaming,
    handleStream,
    output,
  };
};
