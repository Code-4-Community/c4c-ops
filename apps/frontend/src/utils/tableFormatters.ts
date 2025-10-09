/**
 * Utility functions for formatting table data and values.
 */

/**
 * Formats stage/status text by replacing underscores with spaces
 * and capitalizing each word.
 *
 * @param text - The text to format
 * @returns Formatted text
 *
 * @example
 * ```ts
 * formatText('APP_RECEIVED') // 'Application Received'
 * formatText('pm_challenge') // 'Pm Challenge'
 * ```
 */
export const formatText = (text: string): string => {
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace('App Received', 'Application Received');
};

/**
 * Formats a stage name for display.
 * Alias for formatText for better semantic clarity.
 *
 * @param stage - The stage string to format
 * @returns Formatted stage name
 */
export const formatStageName = (stage: string): string => {
  return formatText(stage);
};

/**
 * Maps a human-readable stage string to its enum key.
 *
 * @param stageString - The formatted stage string
 * @returns The enum key representation
 *
 * @example
 * ```ts
 * mapStageStringToEnumKey('Application Received') // 'APP_RECEIVED'
 * mapStageStringToEnumKey('PM Challenge') // 'PM_CHALLENGE'
 * ```
 */
export const mapStageStringToEnumKey = (stageString: string): string => {
  const stageMap: { [key: string]: string } = {
    'Application Received': 'APP_RECEIVED',
    'PM Challenge': 'PM_CHALLENGE',
    'Behavioral Interview': 'B_INTERVIEW',
    'Technical Interview': 'T_INTERVIEW',
    Accepted: 'ACCEPTED',
    Rejected: 'REJECTED',
    'Accepted/Rejected': 'ACCEPTED', // fallback for combined
  };
  return stageMap[stageString] || stageString;
};

/**
 * Maps an enum key to its human-readable stage value.
 *
 * @param enumKey - The enum key
 * @returns The formatted stage value
 *
 * @example
 * ```ts
 * mapEnumKeyToStageValue('APP_RECEIVED') // 'Application Received'
 * mapEnumKeyToStageValue('PM_CHALLENGE') // 'PM Challenge'
 * ```
 */
export const mapEnumKeyToStageValue = (enumKey: string): string => {
  const keyToValueMap: { [key: string]: string } = {
    APP_RECEIVED: 'Application Received',
    PM_CHALLENGE: 'PM Challenge',
    B_INTERVIEW: 'Behavioral Interview',
    T_INTERVIEW: 'Technical Interview',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
  };
  return keyToValueMap[enumKey] || enumKey;
};

/**
 * Formats a rating value for display.
 *
 * @param rating - The numeric rating
 * @returns Formatted rating string with one decimal place
 *
 * @example
 * ```ts
 * formatRating(4.567) // '4.6'
 * formatRating(3) // '3.0'
 * ```
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Formats a date for display.
 *
 * @param date - The date to format
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date('2024-10-08')) // '10/8/2024' (locale-dependent)
 * ```
 */
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString();
};
