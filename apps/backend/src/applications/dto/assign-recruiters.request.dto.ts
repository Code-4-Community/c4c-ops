import { IsArray, IsNumber, IsPositive } from 'class-validator';
import { AssignRecruitersRequest } from '@shared/dto/request/application.dto';

export class AssignRecruitersRequestDTO implements AssignRecruitersRequest {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  recruiterIds: number[];
}
