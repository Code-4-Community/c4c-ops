// TODO: CHANGE IF THE STAGES/REVIEWED statuses change, taken from github 07/01/2025

export const REVIEWED_STATUSES = [
  'Unassigned',
  'Assigned',
  'Reviewing',
  'Reviewed',
  'Decision Made',
] as const;

export const STAGE_STATUSES = [
  'Application Received',
  'PM Challenge',
  'Technical Interview',
  'Behavioral Interview',
  'Accepted/Rejected',
] as const;

// Type-safe versions
export type ApplicationStage = (typeof STAGE_STATUSES)[number];
export type ReviewStatus = (typeof REVIEWED_STATUSES)[number];
