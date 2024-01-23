import { Semester } from '../types';

export class Cycle {
  constructor(private year: number, private semester: Semester) {}

  public isCurrentCycle(cycle: Cycle): boolean {
    return this.year === cycle.year && this.semester === cycle.semester;
  }
}
