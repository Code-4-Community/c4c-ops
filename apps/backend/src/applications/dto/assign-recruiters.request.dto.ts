import { IsArray, IsNumber, IsPositive } from 'class-validator';

export class AssignRecruitersRequestDTO {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  recruiterIds: number[];
}
