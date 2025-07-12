import { IsPositive, IsArray } from 'class-validator';
import { AssignedRecruiterDTO } from './get-application.response.dto';

export class GetAssignedRecruitersResponseDTO {
  @IsPositive()
  applicationId: number;

  @IsArray()
  assignedRecruiters: AssignedRecruiterDTO[];
}
