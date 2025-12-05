/* eslint-disable @nx/enforce-module-boundaries */
import 'reflect-metadata';
import './register-paths';
import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import fs from 'fs';

import { User } from '../src/users/user.entity';
import { Application } from '../src/applications/application.entity';
import { Review } from '../src/reviews/review.entity';
import { FileUpload } from '../src/file-upload/entities/file-upload.entity';
import { PluralNamingStrategy } from '../src/strategies/plural-naming.strategy';

import { UserStatus } from '../../shared/types/user.types';
import {
  ApplicationStage,
  Position,
  Response,
  ReviewStatus,
  Semester,
  StageProgress,
} from '../../shared/types/application.types';

interface UserSeedDescriptor {
  status: UserStatus;
  firstName: string;
  lastName: string;
}

interface SeedConfig {
  personalUser?: PersonalUserConfig;
}

interface PersonalUserConfig {
  firstName: string;
  lastName: string;
  email: string;
  status?: UserStatus;
}

const FIRST_NAMES = [
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Quinn',
  'Riley',
  'Casey',
  'Parker',
];

const LAST_NAMES = [
  'Reyes',
  'Patel',
  'Nguyen',
  'Rivera',
  'Sanchez',
  'Kim',
  'Osei',
  'Dubois',
  'Khan',
  'Moreno',
];

const STATUS_COUNTS: Array<{ status: UserStatus; count: number }> = [
  { status: UserStatus.ADMIN, count: 3 },
  { status: UserStatus.RECRUITER, count: 10 },
  { status: UserStatus.APPLICANT, count: 50 },
];

const APPLICATION_STAGES = Object.values(ApplicationStage);
const STAGE_PROGRESS_VALUES = Object.values(StageProgress);
const REVIEW_STATUS_VALUES = Object.values(ReviewStatus);
const POSITIONS = Object.values(Position);
const SEMESTER_DEFAULT = Semester.SPRING;
const YEAR_DEFAULT = 2026;
const REVIEW_COMMENTS = [
  'Strong analytical breakdown with measurable success metrics.',
  'Creative approach to ambiguous prompts and thoughtful user empathy.',
  'Great initiative but would like deeper dives into tradeoffs.',
  'Excellent presentation polish and storytelling under time pressure.',
  'Solid collaboration signals; digs into blockers proactively.',
  'Needs more rigor around experimentation but strategy instincts are sound.',
  'Powerful technical depth with clean architecture diagrams.',
  'Great culture add with emphasis on mentoring and peer support.',
];
const REVIEW_FOCUS_AREAS = [
  'product sense',
  'execution',
  'communication',
  'technical depth',
  'user research',
  'data fluency',
  'leadership',
];
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ROLE_LABELS: Record<Position, string> = {
  [Position.DEVELOPER]: 'Developer',
  [Position.PM]: 'Product Manager',
  [Position.DESIGNER]: 'Designer',
};

async function main() {
  const envLoaded = loadEnvIfPresent('../.env');
  if (envLoaded) {
    console.log('Loaded environment variables from apps/backend/.env');
  }

  const config = loadConfig('./seed.config.json');
  if (config.personalUser) {
    console.log('Personal seed user configured.');
  }

  ensureEnv([
    'NX_DB_HOST',
    'NX_DB_USERNAME',
    'NX_DB_PASSWORD',
    // database name optional, defaults below
  ]);

  const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.NX_DB_HOST,
    port: Number(process.env.NX_DB_PORT ?? 5432),
    username: process.env.NX_DB_USERNAME,
    password: process.env.NX_DB_PASSWORD,
    database: process.env.NX_DB_DATABASE ?? 'c4c-ops',
    entities: [User, Application, Review, FileUpload],
    namingStrategy: new PluralNamingStrategy(),
    synchronize: false,
    logging: false,
  };

  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Connected to database, wiping target tables...');

    await clearExistingData(dataSource);

    const users = await seedUsers(dataSource, config.personalUser);
    const applications = await seedApplications(
      dataSource,
      users,
      config.personalUser,
    );
    const reviews = await seedReviews(dataSource, applications, users);

    console.log(
      `Seed complete. Inserted ${users.length} users, ${applications.length} applications, and ${reviews.length} reviews.`,
    );
  } catch (error) {
    console.error('Mock data seed failed:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

async function clearExistingData(dataSource: DataSource) {
  const reviewRepo = dataSource.getRepository(Review);
  const fileUploadRepo = dataSource.getRepository(FileUpload);
  const appRepo = dataSource.getRepository(Application);
  const userRepo = dataSource.getRepository(User);

  // Order matters because of foreign-key constraints.
  await reviewRepo.delete({});
  await fileUploadRepo.delete({});
  await appRepo.delete({});
  await userRepo.delete({});
}

async function seedUsers(
  dataSource: DataSource,
  personalUser?: PersonalUserConfig,
): Promise<User[]> {
  const userRepo = dataSource.getRepository(User);
  const namePairs = buildNamePairs();
  const seeds: UserSeedDescriptor[] = [];
  let nameCursor = 0;

  STATUS_COUNTS.forEach(({ status, count }) => {
    for (let i = 0; i < count; i++) {
      const pair = namePairs[nameCursor % namePairs.length];
      nameCursor += 1;
      seeds.push({
        status,
        firstName: pair.firstName,
        lastName: pair.lastName,
      });
    }
  });

  const users = seeds.map((seed, index) =>
    userRepo.create({
      status: seed.status,
      firstName: seed.firstName,
      lastName: seed.lastName,
      email: buildEmail(seed.firstName, seed.lastName, index),
    }),
  );

  if (personalUser) {
    users.unshift(
      userRepo.create({
        status: personalUser.status ?? UserStatus.ADMIN,
        firstName: personalUser.firstName,
        lastName: personalUser.lastName,
        email: personalUser.email,
      }),
    );
  }

  console.log(`Generating ${users.length} user rows...`);
  return userRepo.save(users);
}

async function seedApplications(
  dataSource: DataSource,
  users: User[],
  personalUserConfig?: PersonalUserConfig,
): Promise<Application[]> {
  const appRepo = dataSource.getRepository(Application);
  const personalUser =
    personalUserConfig &&
    users.find(
      (user) =>
        user.email?.toLowerCase() === personalUserConfig.email.toLowerCase(),
    );

  const applicantUsers = users.filter(
    (user) => user.status === UserStatus.APPLICANT,
  );
  if (!applicantUsers.length && !personalUser) {
    throw new Error('No applicant users available to attach applications.');
  }

  const recruiterIds = users
    .filter((user) => user.status === UserStatus.RECRUITER)
    .map((user) => user.id);

  const applications = applicantUsers.map((owner, index) => {
    const position = POSITIONS[index % POSITIONS.length];
    const stage = APPLICATION_STAGES[index % APPLICATION_STAGES.length];
    const stageProgress =
      STAGE_PROGRESS_VALUES[index % STAGE_PROGRESS_VALUES.length];
    const reviewStatus =
      REVIEW_STATUS_VALUES[index % REVIEW_STATUS_VALUES.length];
    const semester = SEMESTER_DEFAULT;
    const assignedRecruiterIds =
      recruiterIds.length === 0
        ? []
        : buildAssignedRecruiters(recruiterIds, index);
    const createdAt = new Date(
      Date.UTC(YEAR_DEFAULT, (index * 3) % 12, (index % 27) + 1, 12, 0, 0),
    );
    const response = buildApplicationResponses(owner, position);

    return appRepo.create({
      user: owner,
      content: `Detailed cover letter for ${position} (${stage}).`,
      createdAt,
      year: YEAR_DEFAULT,
      semester,
      position,
      stage,
      stageProgress,
      reviewStatus,
      response,
      assignedRecruiterIds,
    });
  });

  if (personalUser) {
    const hardcodedApplication = appRepo.create({
      user: personalUser,
      content: `Personal application seed for ${personalUser.firstName} ${personalUser.lastName}.`,
      createdAt: new Date(Date.UTC(YEAR_DEFAULT, 0, 15, 12, 0, 0)),
      year: YEAR_DEFAULT,
      semester: SEMESTER_DEFAULT,
      position: Position.PM,
      stage: ApplicationStage.PM_CHALLENGE,
      stageProgress: StageProgress.PENDING,
      reviewStatus: ReviewStatus.UNASSIGNED,
      response: buildApplicationResponses(personalUser, Position.PM),
      assignedRecruiterIds:
        recruiterIds.length === 0
          ? []
          : buildAssignedRecruiters(recruiterIds, applications.length),
    });

    applications.push(hardcodedApplication);
  }

  console.log(`Generating ${applications.length} application rows...`);
  return appRepo.save(applications);
}

async function seedReviews(
  dataSource: DataSource,
  applications: Application[],
  users: User[],
): Promise<Review[]> {
  const reviewRepo = dataSource.getRepository(Review);
  const recruiterMap = new Map<number, User>(
    users
      .filter((user) => user.status === UserStatus.RECRUITER)
      .map((recruiter) => [recruiter.id, recruiter]),
  );

  const reviews: Review[] = [];

  applications.forEach((application, index) => {
    const assigned = application.assignedRecruiterIds ?? [];
    if (!assigned.length) {
      return;
    }

    const reviewCount = index % 3; // cycle through 0, 1, 2 reviews per applicant

    for (let offset = 0; offset < reviewCount; offset++) {
      const reviewerId = assigned[(index + offset) % assigned.length];
      const reviewer = recruiterMap.get(reviewerId);
      if (!reviewer) {
        continue;
      }

      const stage =
        APPLICATION_STAGES[
          (index + reviewerId + offset) % APPLICATION_STAGES.length
        ];
      const ratingBase =
        1 + ((index * 17 + reviewerId * 13 + offset * 7) % 40) / 10;
      const rating = Number(Math.min(5, ratingBase).toFixed(1));
      const commentSeed =
        (index + reviewerId + offset) % REVIEW_COMMENTS.length;
      const focus =
        REVIEW_FOCUS_AREAS[(index + offset) % REVIEW_FOCUS_AREAS.length];
      const content = `${REVIEW_COMMENTS[commentSeed]} Focused on ${focus} for the ${application.position} track.`;
      const baseDate = application.createdAt
        ? new Date(application.createdAt)
        : new Date(Date.UTC(YEAR_DEFAULT, 0, 1));
      const createdAt = new Date(baseDate.getTime() + (offset + 1) * DAY_IN_MS);

      reviews.push(
        reviewRepo.create({
          application,
          reviewer,
          reviewerId,
          rating,
          stage,
          content,
          createdAt,
          updatedAt: createdAt,
        }),
      );
    }
  });

  console.log(`Generating ${reviews.length} review rows...`);
  if (!reviews.length) {
    return [];
  }

  return reviewRepo.save(reviews);
}

function buildApplicationResponses(
  owner: User,
  position: Position,
): Response[] {
  return [
    {
      question: 'Full Name',
      answer: buildFullName(owner),
    },
    {
      question: 'Email',
      answer: owner.email,
    },
    {
      question: 'Role',
      answer: ROLE_LABELS[position],
    },
  ];
}

function buildFullName(user: User): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || 'Unknown Applicant';
}

function buildNamePairs(): Array<{ firstName: string; lastName: string }> {
  const pairs: Array<{ firstName: string; lastName: string }> = [];
  FIRST_NAMES.forEach((firstName) => {
    LAST_NAMES.forEach((lastName) => {
      pairs.push({ firstName, lastName });
    });
  });
  return pairs;
}

function buildEmail(
  firstName: string,
  lastName: string,
  index: number,
): string {
  const sanitizedFirst = sanitizeForEmail(firstName);
  const sanitizedLast = sanitizeForEmail(lastName);
  const uniqueSuffix = index.toString().padStart(3, '0');
  return `${sanitizedFirst}.${sanitizedLast}${uniqueSuffix}@example.com`;
}

function sanitizeForEmail(value: string): string {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned || 'user';
}

function buildAssignedRecruiters(ids: number[], index: number): number[] {
  const uniqueIds = new Set<number>();
  const howMany = (index % 3) + 1; // assign between 1 and 3 recruiters where possible

  for (let offset = 0; offset < howMany; offset++) {
    const recruiterId = ids[(index + offset * 2) % ids.length];
    uniqueIds.add(recruiterId);
    if (uniqueIds.size === ids.length) {
      break;
    }
  }

  return Array.from(uniqueIds);
}

function loadEnvIfPresent(relativePath: string): boolean {
  const envPath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(envPath)) {
    return false;
  }

  const contents = fs.readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const [key, ...rest] = trimmed.split('=');
    if (!key || !rest.length) {
      return;
    }

    if (process.env[key] !== undefined) {
      return;
    }

    const value = rest
      .join('=')
      .trim()
      .replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  });

  return true;
}

function loadConfig(relativePath: string): SeedConfig {
  const configPath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(
      `Failed to parse seed config at ${configPath}. Falling back to defaults.`,
      error,
    );
    return {};
  }
}

function ensureEnv(requiredKeys: string[]) {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required database environment variables: ${missing.join(', ')}`,
    );
  }
}

main();
