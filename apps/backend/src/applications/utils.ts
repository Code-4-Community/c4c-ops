import { Logger } from '@nestjs/common';
import { Application } from './application.entity';
import { Cycle } from './dto/cycle';
import { Semester } from '../../../shared/types/application.types';
import {
  getRecruitmentCycle,
  getRecruitmentSemester,
  getRecruitmentYear,
} from '@shared/utils/cycle';

const logger = new Logger('ApplicationsUtils');

export const getCurrentSemester = (): Semester => getRecruitmentSemester();

export const getCurrentYear = (): number => getRecruitmentYear();

export const getCurrentCycle = () => {
  const { year, semester } = getRecruitmentCycle();
  return new Cycle(year, semester);
};

export const getAppForCurrentCycle = (
  applications: Application[],
): Application | null => {
  if (applications.length === 0) {
    logger.debug('No applications provided when determining current cycle');
    return null;
  }

  const currentCycle = getCurrentCycle();
  logger.debug(
    `Looking for application in current cycle (year=${currentCycle.year}, semester=${currentCycle.semester}) among ${applications.length} records`,
  );
  for (const application of applications) {
    const cycle = new Cycle(application.year, application.semester);
    if (cycle.isCurrentCycle(currentCycle)) {
      logger.debug(
        `Found application ${application.id} matching current cycle`,
      );
      return application;
    }
  }

  logger.debug('No application matched the current cycle');
  return null;
};
