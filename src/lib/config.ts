// =====================================================
// Application Configuration
// Easily editable evaluation questions and app settings
// =====================================================

/**
 * Evaluation questions configuration.
 * Based on the official judging criteria of
 * ಸಾರ್ವಜನಿಕ ಜನ ಜಾಗೃತಿ ಗಣಪತಿ ಪ್ರೋತ್ಸಾಹ ಸ್ಪರ್ಧೆ 2026
 * Organized by: ಶ್ರೀ ಮಾನ್ಯ, ಬಾಲ ಗಂಗಾಧರ ತಿಲಕ್ ಸಮಿತಿ, ಕೊಪ್ಪಳ
 */
export const EVALUATION_QUESTIONS = [
  {
    id: 'idol_rating',
    label: 'ಗಣೇಶ ವಿಗ್ರಹ / Ganesha Idol',
    labelKannada: 'ಪರಿಸರ ಸ್ನೇಹಿ ಮಣ್ಣಿನ ಗಣಪ ಪ್ರತಿಷ್ಠಾಪನೆ',
    labelEnglish: 'Eco-Friendly Clay Ganesha Idol',
    question: 'ಮಣ್ಣಿನ ಗಣಪ ವಿಗ್ರಹದ ಗುಣಮಟ್ಟ ಮತ್ತು ಪರಿಸರ ಸ್ನೇಹಿ ಸ್ಥಾಪನೆಯನ್ನು ನಿಮ್ಮ ಅಭಿಪ್ರಾಯದಿಂದ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    questionEnglish: 'Rate the quality & eco-friendliness of the clay Ganesha idol installation',
    shortLabel: 'ವಿಗ್ರಹ / Idol',
  },
  {
    id: 'decoration_rating',
    label: 'ಮಂಟಪ ಅಲಂಕಾರ / Pandal Decoration',
    labelKannada: 'ಗಣಪತಿಯ ಮಂಟಪ (ಟೆಂಟ್) ಅಲಂಕಾರ',
    labelEnglish: 'Pandal Decoration & Theme',
    question: 'ಮಂಟಪದ ಅಲಂಕಾರ, ಥೀಮ್ ಮತ್ತು ಸೌಂದರ್ಯವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    questionEnglish: 'Rate the decoration, theme and visual beauty of the pandal',
    shortLabel: 'ಅಲಂಕಾರ / Decor',
  },
  {
    id: 'lighting_rating',
    label: 'ದೀಪಾಲಂಕಾರ / Lighting',
    labelKannada: 'ದೀಪ ಮತ್ತು ವಿದ್ಯುತ್ ಅಲಂಕಾರ',
    labelEnglish: 'Lighting & Illumination',
    question: 'ಮಂಟಪದ ದೀಪಾಲಂಕಾರ ಮತ್ತು ಬೆಳಕಿನ ವ್ಯವಸ್ಥೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    questionEnglish: 'Rate the lighting arrangements and illumination of the pandal',
    shortLabel: 'ದೀಪ / Lighting',
  },
  {
    id: 'creativity_rating',
    label: 'ಸಾಮಾಜಿಕ ಸಂದೇಶ / Social Message',
    labelKannada: 'ಸಾರ್ವಜನಿಕರಿಗೆ ಒಳ್ಳೆ ಸಂದೇಶ ಮತ್ತು ಜಾಗೃತಿ',
    labelEnglish: 'Awareness & Social Message',
    question: 'ಮಂಡಳಿ ಸಾರ್ವಜನಿಕರಿಗೆ ನೀಡುವ ಸಂದೇಶ ಮತ್ತು ಜನ ಜಾಗೃತಿ ಕಾರ್ಯಕ್ರಮದ ಗುಣಮಟ್ಟವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    questionEnglish: 'Rate the social awareness message and public outreach activities of the mandal',
    shortLabel: 'ಸಂದೇಶ / Message',
  },
  {
    id: 'cleanliness_rating',
    label: 'ಸ್ವಚ್ಛತೆ / Cleanliness',
    labelKannada: 'ಮಂಟಪ ಮತ್ತು ಪರಿಸರದ ಸ್ವಚ್ಛತೆ',
    labelEnglish: 'Pandal & Surroundings Cleanliness',
    question: 'ಗಣಪತಿಯ ಮಂಟಪ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶದ ಸ್ವಚ್ಛತೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    questionEnglish: 'Rate the cleanliness of the pandal and its surroundings',
    shortLabel: 'ಸ್ವಚ್ಛತೆ / Clean',
  },
  {
    id: 'eco_friendly_rating',
    label: 'ಪರಿಸರ ಸ್ನೇಹಿ / Eco-Friendly',
    labelKannada: 'ಪರಿಸರ ಸ್ನೇಹಿ ಆಚರಣೆ ಮತ್ತು ವ್ಯವಸ್ಥೆ',
    labelEnglish: 'Eco-Friendly Practices & Arrangements',
    question: 'ಮಂಡಳಿಯ ಪರಿಸರ ಸ್ನೇಹಿ ಚಟುವಟಿಕೆ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್ ಮುಕ್ತ ಆಚರಣೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    questionEnglish: 'Rate the mandal\'s eco-friendly and plastic-free celebration practices',
    shortLabel: 'ಪರಿಸರ / Eco',
  },
  {
    id: 'cultural_rating',
    label: 'ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮ / Cultural Programs',
    labelKannada: 'ಧಾರ್ಮಿಕ, ಸಾಂಸ್ಕೃತಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮ',
    labelEnglish: 'Religious, Cultural & Social Programs',
    question: 'ಮಂಡಳಿಯ ಧಾರ್ಮಿಕ, ಸಾಂಸ್ಕೃತಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಗುಣಮಟ್ಟವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    questionEnglish: 'Rate the quality of religious, cultural and social awareness programs organized',
    shortLabel: 'ಕಾರ್ಯಕ್ರಮ / Culture',
  },
  {
    id: 'overall_rating',
    label: 'ಒಟ್ಟಾರೆ ಅನುಭವ / Overall Experience',
    labelKannada: 'ಒಟ್ಟಾರೆ ಮಂಡಳಿ ಮೌಲ್ಯಮಾಪನ',
    labelEnglish: 'Overall Mandal Rating',
    question: 'ಈ ಗಣೇಶ ಮಂಡಳಿಗೆ ನಿಮ್ಮ ಒಟ್ಟಾರೆ ಮೌಲ್ಯಮಾಪನ ನೀಡಿ',
    questionEnglish: 'Give your overall rating for this Ganesh Mandal',
    shortLabel: 'ಒಟ್ಟು / Overall',
  },
] as const;

/**
 * Rating labels for star values — Bilingual (Kannada / English)
 */
export const RATING_LABELS: Record<number, string> = {
  1: 'ಕಳಪೆ / Poor',
  2: 'ಸಾಧಾರಣ / Average',
  3: 'ಒಳ್ಳೆಯದು / Good',
  4: 'ತುಂಬಾ ಒಳ್ಳೆಯದು / Very Good',
  5: 'ಅತ್ಯುತ್ತಮ / Excellent',
};

/**
 * App constants — matching the official event poster
 */
export const APP_CONFIG = {
  appName: 'ಸಾರ್ವಜನಿಕ ಜನ ಜಾಗೃತಿ ಗಣಪತಿ ಪ್ರೋತ್ಸಾಹ ಸ್ಪರ್ಧೆ 2026',
  appNameEnglish: 'Sarvajanik Jana Jagrti Ganapathi Protsaha Spardhe 2026',
  organizer: 'ಶ್ರೀ ಮಾನ್ಯ, ಬಾಲ ಗಂಗಾಧರ ತಿಲಕ್ ಸಮಿತಿ, ಕೊಪ್ಪಳ',
  organizerEnglish: 'Shri Manya, Bala Gangadhara Tilak Samiti, Koppal',
  subtitle: 'ಸಾರ್ವಜನಿಕ ಮೌಲ್ಯಮಾಪನ ವೇದಿಕೆ / Public Evaluation Portal',
  feedbackMaxLength: 500,
  year: 2026,
} as const;

/**
 * Mask email for display: john.doe@gmail.com → jo***@gmail.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  const visibleChars = Math.min(2, local.length);
  return `${local.substring(0, visibleChars)}${'*'.repeat(Math.max(1, local.length - visibleChars))}@${domain}`;
}
