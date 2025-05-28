
import { RecordingStatus } from '@/components/RecordingControls';

interface ValidationResult {
  isValid: boolean;
  reason?: string;
  currentLength?: number;
  difference?: number;
}

export const validateTranscript = (
  transcript: string,
  lastProcessedTranscript: string,
  status: RecordingStatus
): ValidationResult => {
  // No transcript at all
  if (!transcript || transcript.trim().length === 0) {
    return { isValid: false, reason: 'no transcript' };
  }

  // Not in recording state - this was the main issue
  if (status !== 'recording') {
    return { isValid: false, reason: `status is ${status}, not recording` };
  }

  const currentLength = transcript.trim().length;
  const lastLength = lastProcessedTranscript.trim().length;
  const difference = currentLength - lastLength;

  // Transcript is shorter than last processed (shouldn't happen but safety check)
  if (currentLength < lastLength) {
    return { 
      isValid: false, 
      reason: 'transcript shorter than last processed',
      currentLength,
      difference
    };
  }

  // Not enough new content to process (reduced threshold for better responsiveness)
  if (difference < 5) {
    return { 
      isValid: false, 
      reason: 'not enough new content',
      currentLength,
      difference
    };
  }

  // All checks passed
  return { 
    isValid: true,
    currentLength,
    difference
  };
};
