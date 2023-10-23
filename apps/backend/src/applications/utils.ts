import { Cycle } from './dto/cycle.dto';
import { Semester } from './types';

export const getCurrentCycle = () => new Cycle(2023, Semester.FALL);
