
interface ValidationResult {
  isValid: boolean;
  reason?: string;
  currentLength?: number;
  difference?: number;
}

export const validateTranscript = (
  transcript: string,
  lastProcessedTranscript: string,
  status: string
): ValidationResult => {
  // Only process if we have a transcript and we're in recording mode
  if (!transcript) {
    return { isValid: false, reason: 'no transcript' };
  }

  if (status !== 'recording') {
    return { isValid: false, reason: 'status not recording' };
  }

  const currentTranscript = transcript.trim();
  
  // More sophisticated duplicate detection
  if (currentTranscript === lastProcessedTranscript || 
      currentTranscript.length < 10 ||
      (currentTranscript.startsWith(lastProcessedTranscript) &&
      currentTranscript.length - lastProcessedTranscript.length < 5)) {
    return { 
      isValid: false, 
      reason: 'duplicate or insufficient transcript',
      currentLength: currentTranscript.length,
      difference: currentTranscript.length - lastProcessedTranscript.length
    };
  }

  return { isValid: true };
};
