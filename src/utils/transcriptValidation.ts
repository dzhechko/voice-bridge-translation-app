
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

  // Only process during recording state
  if (status !== 'recording') {
    return { isValid: false, reason: `status is ${status}, not recording` };
  }

  const currentLength = transcript.trim().length;
  const lastLength = lastProcessedTranscript.trim().length;
  const difference = currentLength - lastLength;

  // Allow processing if transcript is significantly shorter (reset scenario)
  if (currentLength < lastLength && (lastLength - currentLength) > 10) {
    console.log('Transcript reset detected - allowing processing');
    return { 
      isValid: true, 
      reason: 'transcript reset detected',
      currentLength,
      difference
    };
  }

  // For very short transcripts, require less new content
  if (currentLength < 20) {
    if (difference < 3) {
      return { 
        isValid: false, 
        reason: 'not enough new content for short transcript',
        currentLength,
        difference
      };
    }
  } else {
    // For longer transcripts, require meaningful new content
    if (difference < 8) {
      return { 
        isValid: false, 
        reason: 'not enough new content',
        currentLength,
        difference
      };
    }
  }

  // All checks passed
  return { 
    isValid: true,
    currentLength,
    difference
  };
};
