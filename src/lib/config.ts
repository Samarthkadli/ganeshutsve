// =====================================================
// Application Configuration
// 10 Evaluation Questions & 10-Point Rating System
// =====================================================

/**
 * Evaluation questions configuration (10 Questions).
 * Based on official judging criteria of
 * ಸಾರ್ವಜನಿಕ ಜನ ಜಾಗೃತಿ ಗಣಪತಿ ಪ್ರೋತ್ಸಾಹ ಸ್ಪರ್ಧೆ 2026
 * Organized by: ಶ್ರೀ ಮಾನ್ಯ, ಬಾಲ ಗಂಗಾಧರ ತಿಲಕ್ ಸಮಿತಿ, ಕೊಪ್ಪಳ
 */
export const EVALUATION_QUESTIONS = [
  {
    id: 'idol_rating',
    label: '1. ಗಣೇಶ ವಿಗ್ರಹ / Ganesha Idol',
    labelKannada: '1. ಪರಿಸರ ಸ್ನೇಹಿ ಮಣ್ಣಿನ ಗಣಪ ಪ್ರತಿಷ್ಠಾಪನೆ',
    labelEnglish: '1. Eco-Friendly Clay Ganesha Idol',
    question: 'ಮಣ್ಣಿನ ಗಣಪ ವಿಗ್ರಹದ ಗುಣಮಟ್ಟ ಮತ್ತು ಪರಿಸರ ಸ್ನೇಹಿ ಸ್ಥಾಪನೆಯನ್ನು ನಿಮ್ಮ ಅಭಿಪ್ರಾಯದಿಂದ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the quality & eco-friendliness of the clay Ganesha idol installation (out of 10)',
    shortLabel: 'ವಿಗ್ರಹ / Idol',
  },
  {
    id: 'decoration_rating',
    label: '2. ಮಂಟಪ ಅಲಂಕಾರ / Pandal Decoration',
    labelKannada: '2. ಗಣಪತಿಯ ಮಂಟಪ (ಟೆಂಟ್) ಅಲಂಕಾರ',
    labelEnglish: '2. Pandal Decoration & Theme',
    question: 'ಮಂಟಪದ ಅಲಂಕಾರ, ಥೀಮ್ ಮತ್ತು ಸೌಂದರ್ಯವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the decoration, theme and visual beauty of the pandal (out of 10)',
    shortLabel: 'ಅಲಂಕಾರ / Decor',
  },
  {
    id: 'lighting_rating',
    label: '3. ದೀಪಾಲಂಕಾರ / Lighting',
    labelKannada: '3. ದೀಪ ಮತ್ತು ವಿದ್ಯುತ್ ಅಲಂಕಾರ',
    labelEnglish: '3. Lighting & Illumination',
    question: 'ಮಂಟಪದ ದೀಪಾಲಂಕಾರ ಮತ್ತು ಬೆಳಕಿನ ವ್ಯವಸ್ಥೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the lighting arrangements and illumination of the pandal (out of 10)',
    shortLabel: 'ದೀಪ / Lighting',
  },
  {
    id: 'creativity_rating',
    label: '4. ಸಾಮಾಜಿಕ ಸಂದೇಶ / Social Message',
    labelKannada: '4. ಸಾರ್ವಜನಿಕರಿಗೆ ಒಳ್ಳೆ ಸಂದೇಶ ಮತ್ತು ಜಾಗೃತಿ',
    labelEnglish: '4. Awareness & Social Message',
    question: 'ಮಂಡಳಿ ಸಾರ್ವಜನಿಕರಿಗೆ ನೀಡುವ ಸಂದೇಶ ಮತ್ತು ಜನ ಜಾಗೃತಿ ಕಾರ್ಯಕ್ರಮದ ಗುಣಮಟ್ಟವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the social awareness message and public outreach activities of the mandal (out of 10)',
    shortLabel: 'ಸಂದೇಶ / Message',
  },
  {
    id: 'cleanliness_rating',
    label: '5. ಸ್ವಚ್ಛತೆ / Cleanliness',
    labelKannada: '5. ಮಂಟಪ ಮತ್ತು ಪರಿಸರದ ಸ್ವಚ್ಛತೆ',
    labelEnglish: '5. Pandal & Surroundings Cleanliness',
    question: 'ಗಣಪತಿಯ ಮಂಟಪ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶದ ಸ್ವಚ್ಛತೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the cleanliness of the pandal and its surroundings (out of 10)',
    shortLabel: 'ಸ್ವಚ್ಛತೆ / Clean',
  },
  {
    id: 'eco_friendly_rating',
    label: '6. ಪರಿಸರ ಸ್ನೇಹಿ / Eco-Friendly',
    labelKannada: '6. ಪರಿಸರ ಸ್ನೇಹಿ ಆಚರಣೆ ಮತ್ತು ವ್ಯವಸ್ಥೆ',
    labelEnglish: '6. Eco-Friendly Practices & Arrangements',
    question: 'ಮಂಡಳಿಯ ಪರಿಸರ ಸ್ನೇಹಿ ಚಟುವಟಿಕೆ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್ ಮುಕ್ತ ಆಚರಣೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the mandal\'s eco-friendly and plastic-free celebration practices (out of 10)',
    shortLabel: 'ಪರಿಸರ / Eco',
  },
  {
    id: 'cultural_rating',
    label: '7. ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮ / Cultural Programs',
    labelKannada: '7. ಧಾರ್ಮಿಕ, ಸಾಂಸ್ಕೃತಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮ',
    labelEnglish: '7. Religious, Cultural & Social Programs',
    question: 'ಮಂಡಳಿಯ ಧಾರ್ಮಿಕ, ಸಾಂಸ್ಕೃತಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಗುಣಮಟ್ಟವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the quality of religious, cultural and social awareness programs organized (out of 10)',
    shortLabel: 'ಕಾರ್ಯಕ್ರಮ / Culture',
  },
  {
    id: 'discipline_rating',
    label: '8. ಶಿಸ್ತು ಮತ್ತು ಭದ್ರತೆ / Discipline & Safety',
    labelKannada: '8. ಮಂಟಪದ ಶಿಸ್ತು, ಶಾಂತಿ ಮತ್ತು ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ',
    labelEnglish: '8. Pandal Discipline, Crowd & Traffic Control',
    question: 'ಮಂಡಳಿಯ ಶಿಸ್ತು, ಭಕ್ತಾದಿಗಳ ಸಾಲು ವ್ಯವಸ್ಥೆ ಮತ್ತು ಭದ್ರತಾ ಚಟುವಟಿಕೆಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the discipline, crowd queue management and safety measures of the mandal (out of 10)',
    shortLabel: 'ಶಿಸ್ತು / Discipline',
  },
  {
    id: 'facilities_rating',
    label: '9. ಭಕ್ತಾದಿಗಳ ಸೌಲಭ್ಯ / Visitor Facilities',
    labelKannada: '9. ಭಕ್ತಾದಿಗಳಿಗೆ ಕುಡಿಯುವ ನೀರು, ಪ್ರಸಾದ ಮತ್ತು ಸೌಲಭ್ಯ',
    labelEnglish: '9. Drinking Water, Prasadam & Visitor Amenities',
    question: 'ಮಂಟಪಕ್ಕೆ ಬರುವ ಭಕ್ತಾದಿಗಳಿಗೆ ಕಲ್ಪಿಸಲಾದ ಸೌಲಭ್ಯಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Rate the amenities provided for visiting devotees (drinking water, prasadam, sitting) (out of 10)',
    shortLabel: 'ಸೌಲಭ್ಯ / Amenities',
  },
  {
    id: 'overall_rating',
    label: '10. ಒಟ್ಟಾರೆ ಅನುಭವ / Overall Experience',
    labelKannada: '10. ಒಟ್ಟಾರೆ ಮಂಡಳಿ ಮೌಲ್ಯಮಾಪನ',
    labelEnglish: '10. Overall Mandal Rating',
    question: 'ಈ ಗಣೇಶ ಮಂಡಳಿಗೆ ನಿಮ್ಮ ಒಟ್ಟಾರೆ ಮೌಲ್ಯಮಾಪನ ನೀಡಿ (10 ರಲ್ಲಿ)',
    questionEnglish: 'Give your overall rating for this Ganesh Mandal (out of 10 points)',
    shortLabel: 'ಒಟ್ಟು / Overall',
  },
] as const;

/**
 * 10-Point Rating Labels — Bilingual (Kannada / English)
 */
export const RATING_LABELS: Record<number, string> = {
  1: '1/10 • ಕಳಪೆ / Poor',
  2: '2/10 • ಸಾಧಾರಣಕ್ಕಿಂತ ಕಡಿಮೆ / Below Average',
  3: '3/10 • ಸಾಧಾರಣ / Average',
  4: '4/10 • ಪರವಾಗಿಲ್ಲ / Fair',
  5: '5/10 • ಒಳ್ಳೆಯದು / Good',
  6: '6/10 • ಉತ್ತಮ / Above Average',
  7: '7/10 • ತುಂಬಾ ಒಳ್ಳೆಯದು / Very Good',
  8: '8/10 • ಅತ್ಯುತ್ತಮ / Great',
  9: '9/10 • ಅದ್ಭುತ / Excellent',
  10: '10/10 • ಪರಿಪೂರ್ಣ / Outstanding',
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
