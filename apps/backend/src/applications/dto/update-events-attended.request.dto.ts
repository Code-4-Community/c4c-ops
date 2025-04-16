import { IsPositive, Min } from 'class-validator';

export class UpdateEventsAttendedRequestDTO {
  @IsPositive()
  @Min(0)
  eventsAttended: number;
}
