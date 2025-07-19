import { stagesMap } from '../applications.constants';
import { ApplicationStage, ReviewStage, Position } from '../types';

export class ApplicationStatus {
  constructor(private stage: ApplicationStage, private step: ReviewStage) {}

  public getNextStatus(position: Position): ApplicationStatus | null {
    if (
      [ApplicationStage.ACCEPTED, ApplicationStage.REJECTED].includes(
        this.stage,
      )
    ) {
      return null;
    }

    const nextStep =
      this.step === ReviewStage.SUBMITTED
        ? ReviewStage.REVIEWED
        : ReviewStage.SUBMITTED;
    const nextStage =
      this.step === ReviewStage.SUBMITTED
        ? this.stage
        : stagesMap[position][stagesMap[position].indexOf(this.stage) + 1];

    return new ApplicationStatus(nextStage, nextStep);
  }
}
