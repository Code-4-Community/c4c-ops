import { Semester } from '../types/application.types';

/**
 * Recruitment for the fall semester (onboarding in the fall term) happens
 * during February through August. All other months (September through January)
 * are part of the spring recruitment window.
 */
export const getRecruitmentSemester = (date: Date = new Date()): Semester => {
  const month = date.getMonth();
  if (month >= 1 && month <= 7) {
    return Semester.FALL;
  }
  return Semester.SPRING;
};

/**
 * Determines the recruitment year based on the month.
 * When we are in the spring recruitment window (September - January),
 * we are recruiting for the upcoming spring class, so we advance the year.
 */
export const getRecruitmentYear = (date: Date = new Date()): number => {
  const baseYear = date.getFullYear();
  const semester = getRecruitmentSemester(date);
  return semester === Semester.SPRING ? baseYear + 1 : baseYear;
};

export const getRecruitmentCycle = (date: Date = new Date()) => ({
  year: getRecruitmentYear(date),
  semester: getRecruitmentSemester(date),
});
