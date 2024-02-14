import { stagesMap } from '../applications.constants';
import { ApplicationStage, ApplicationStep, Position } from '../types';

export class ApplicationStatus {
  constructor(private stage: ApplicationStage, private step: ApplicationStep) {}

  public getNextStatus(position: Position): ApplicationStatus | null {
    if (
      [ApplicationStage.ACCEPTED, ApplicationStage.REJECTED].includes(
        this.stage,
      )
    ) {
      return null;
    }

    const nextStep =
      this.step === ApplicationStep.SUBMITTED
        ? ApplicationStep.REVIEWED
        : ApplicationStep.SUBMITTED;
    const nextStage =
      this.step === ApplicationStep.SUBMITTED
        ? this.stage
        : stagesMap[position][stagesMap[position].indexOf(this.stage) + 1];

    return new ApplicationStatus(nextStage, nextStep);
  }
}
