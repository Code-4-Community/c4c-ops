import { ApplicationStage, StageProgress, Position } from '../types';
import { stagesMap } from '../applications.constants';

export class ApplicationStatus {
  constructor(
    private stage: ApplicationStage,
    private stageProgress: StageProgress,
    private position: Position,
  ) {}

  public getNextStatus(): ApplicationStatus | null {
    if (
      [ApplicationStage.ACCEPTED, ApplicationStage.REJECTED].includes(
        this.stage,
      )
    ) {
      return null;
    }

    const nextProgress =
      this.stageProgress === StageProgress.PENDING
        ? StageProgress.COMPLETED
        : StageProgress.PENDING;
    const nextStage = this.getNextApplicationStage(this.stage, this.position);

    if (!nextStage) {
      return null;
    }

    return new ApplicationStatus(nextStage, nextProgress, this.position);
  }

  public getNextApplicationStage(
    current: ApplicationStage,
    position: Position,
  ): ApplicationStage | null {
    // Terminal states have no next stage
    if (
      [ApplicationStage.ACCEPTED, ApplicationStage.REJECTED].includes(current)
    ) {
      return null;
    }

    const stagesArr = stagesMap[position];
    const currentIndex = stagesArr.indexOf(current);

    if (currentIndex === -1) {
      // Current stage not in position's flow - this shouldn't happen
      throw new Error(`Invalid stage ${current} for position ${position}`);
    }

    if (currentIndex < stagesArr.length - 1) {
      return stagesArr[currentIndex + 1];
    }

    // No more stages in the flow (ready for final decision)
    return null;
  }
}
