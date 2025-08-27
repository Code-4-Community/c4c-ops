//import { stagesMap } from '../applications.constants';
import { ApplicationStage, ReviewStage, ApplicationStageOrder } from '../types';

export class ApplicationStatus {
  constructor(private stage: ApplicationStage, private step: ReviewStage) {}

  public getNextStatus(): ApplicationStatus | null {
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
    const nextStage = this.getNextApplicationStage(this.stage);

    return new ApplicationStatus(nextStage, nextStep);
  }

  public getNextApplicationStage(
    current: ApplicationStage,
  ): ApplicationStage | undefined {
    const currentIndex = ApplicationStageOrder.indexOf(current);
    if (
      currentIndex !== -1 &&
      currentIndex < ApplicationStageOrder.length - 1
    ) {
      return ApplicationStageOrder[currentIndex + 1];
    }
    return undefined;
  }
}
