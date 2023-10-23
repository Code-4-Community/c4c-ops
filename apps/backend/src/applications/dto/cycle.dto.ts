import { IsEnum, IsPositive } from 'class-validator';
import { Semester } from '../types';

export class Cycle {
  @IsPositive()
  year: number;

  @IsEnum(Semester)
  semester: Semester;

  constructor(year: number, semester: Semester) {
    this.year = year;
    this.semester = semester;
  }

  public isCurrentCycle(cycle: Cycle): boolean {
    return this.year === cycle.year && this.semester === cycle.semester;
  }
}
