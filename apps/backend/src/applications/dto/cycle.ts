import { Semester } from '@shared/types/application.types';

export class Cycle {
  constructor(public year: number, public semester: Semester) {}

  public isCurrentCycle(cycle: Cycle): boolean {
    return this.year === cycle.year && this.semester === cycle.semester;
  }
}
