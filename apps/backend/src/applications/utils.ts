import { Application } from './application.entity';
import { Cycle } from './dto/cycle';
import { Semester } from './types';

// TODO get the current cycle's year and semester from env variables
export const getCurrentCycle = () => new Cycle(2024, Semester.SPRING);

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
