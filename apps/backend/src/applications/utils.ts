import { Application } from './application.entity';
import { Cycle } from './dto/cycle';
import { GetApplicationResponseDTO } from './dto/get-application.response.dto';
import { Semester } from './types';

export const getCurrentSemester = (): Semester => {
  const month: number = new Date().getMonth();
  if (month >= 1 && month <= 7) {
    return Semester.FALL; // We will be recruiting for the fall semester during Feb - Aug
  }
  return Semester.SPRING; // We will be recruiting for the spring semester during Sep - Jan
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

export const toGetApplicationResponseDTO = (
  application: Application,
): GetApplicationResponseDTO => {
  return {
    id: application.id,
    createdAt: application.createdAt,
    year: application.year,
    semester: application.semester,
    position: application.position,
    stage: application.stage,
    step: application.step,
    response: application.response,
    recruiters: application.recruiters,
    reviews: application.reviews,
    numApps: application.numApps,
  };
};
