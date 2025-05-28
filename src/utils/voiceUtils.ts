
export interface VoiceFilterResult {
  filteredVoices: SpeechSynthesisVoice[];
  bestVoice: string;
}

// Function to get language-compatible voices
export const getVoicesForLanguage = (
  targetLanguage: string, 
  availableVoices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice[] => {
  if (!targetLanguage || availableVoices.length === 0) return availableVoices;
  
  const primaryLang = targetLanguage.substring(0, 2).toLowerCase();
  
  // First, get voices that match the exact language code
  const exactMatches = availableVoices.filter(voice => 
    voice.lang.toLowerCase() === targetLanguage.toLowerCase()
  );
  
  // Then, get voices that match the primary language
  const primaryMatches = availableVoices.filter(voice => {
    const voiceLang = voice.lang.substring(0, 2).toLowerCase();
    return voiceLang === primaryLang && 
           voice.lang.toLowerCase() !== targetLanguage.toLowerCase();
  });
  
  // Handle special cases for Chinese
  const chineseMatches = primaryLang === 'zh' ? 
    availableVoices.filter(voice => 
      voice.lang.toLowerCase().includes('cmn') || 
      voice.lang.toLowerCase().includes('chinese')
    ) : [];
  
  // Combine and deduplicate
  const compatibleVoices = [...exactMatches, ...primaryMatches, ...chineseMatches];
  const uniqueVoices = compatibleVoices.filter((voice, index, self) => 
    index === self.findIndex(v => v.name === voice.name)
  );
  
  return uniqueVoices.length > 0 ? uniqueVoices : availableVoices;
};

// Function to find the best voice for a language
export const findBestVoiceForLanguage = (
  targetLanguage: string, 
  availableVoices: SpeechSynthesisVoice[]
): string => {
  const compatibleVoices = getVoicesForLanguage(targetLanguage, availableVoices);
  if (compatibleVoices.length === 0) return '';
  
  const primaryLang = targetLanguage.substring(0, 2).toLowerCase();
  
  // Prefer exact language match
  const exactMatch = compatibleVoices.find(voice => 
    voice.lang.toLowerCase() === targetLanguage.toLowerCase()
  );
  if (exactMatch) return exactMatch.name;
  
  // Then prefer primary language match
  const primaryMatch = compatibleVoices.find(voice => 
    voice.lang.substring(0, 2).toLowerCase() === primaryLang
  );
  if (primaryMatch) return primaryMatch.name;
  
  // Return first available voice
  return compatibleVoices[0].name;
};
