import { Semester } from '@sharedTypes/types/application.types';

/**
 * Gets the current recruitment semester based on the current date.
 *
 * Recruitment periods:
 * - Fall semester: February - August (months 1-7)
 * - Spring semester: September - January (months 8-12, 0)
 *
 * @returns The current recruitment semester
 */
export const getCurrentSemester = (): Semester => {
  const month: number = new Date().getMonth();
  if (month >= 1 && month <= 7) {
    return Semester.FALL;
  }
  return Semester.SPRING;
};

/**
 * Gets the current year.
 *
 * @returns The current year
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};
