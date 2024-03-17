import { Application } from './application.entity';
import { Cycle } from './dto/cycle';
import { Semester } from './types';

export const getCurrentSemester = (): Semester => {
  const month: number = new Date().getMonth();
  if (month >= 0 && month <= 5) {
    return Semester.FALL; // We will be recruiting for the fall semester during Jan - Jun
  }
  return Semester.SPRING; // We will be recruiting for the spring semester during Jul - Dec
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getCurrentCycle = () =>
  new Cycle(getCurrentYear(), getCurrentSemester());

export const getAppForCurrentCycle = (
  applications: Application[],
): Application | null => {
  if (applications.length === 0) {
    return null;
  }

  const currentCycle = getCurrentCycle();
  for (const application of applications) {
    const cycle = new Cycle(application.year, application.semester);
    if (cycle.isCurrentCycle(currentCycle)) {
      return application;
    }
  }

  return null;
};
