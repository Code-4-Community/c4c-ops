import { ApplicationStage, Position } from './types';

// Position-specific stage progressions (excluding terminal states ACCEPTED/REJECTED)
const DEV_STAGES = [
  ApplicationStage.APP_RECEIVED,
  ApplicationStage.T_INTERVIEW,
  ApplicationStage.B_INTERVIEW,
];

const PM_STAGES = [
  ApplicationStage.APP_RECEIVED,
  ApplicationStage.PM_CHALLENGE,
  ApplicationStage.B_INTERVIEW,
];

const DESIGNER_STAGES = [
  ApplicationStage.APP_RECEIVED,
  ApplicationStage.B_INTERVIEW,
];

export const stagesMap: Record<Position, ApplicationStage[]> = {
  [Position.DEVELOPER]: DEV_STAGES,
  [Position.PM]: PM_STAGES,
  [Position.DESIGNER]: DESIGNER_STAGES,
};
