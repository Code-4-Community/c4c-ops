import { plainToClass } from 'class-transformer';
import { Application } from './application.entity';
import { Cycle } from './dto/cycle.dto';
import { Semester } from './types';

// TODO get the current cycle's year and semester from env variables
export const getCurrentCycle = () => new Cycle(2023, Semester.FALL);

export const getAppForCurrentCycle = (
  applications: Application[],
): Application | null => {
  if (applications.length === 0) {
    return null;
  }

  const currentCycle = getCurrentCycle();
  for (const application of applications) {
    const cycle = plainToClass(Cycle, application.cycle);
    if (cycle.isCurrentCycle(currentCycle)) {
      return application;
    }
  }

  return null;
};
