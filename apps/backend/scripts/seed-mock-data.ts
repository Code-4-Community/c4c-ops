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

    console.log(
      `Seed complete. Inserted ${users.length} users and ${applications.length} applications.`,
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
    const response: Response[] = [
      {
        question: 'Why do you want to work on this role?',
        answer: `I am excited to contribute as a ${position} during the ${semester} semester.`,
      },
      {
        question: 'What stage best suits you right now?',
        answer: `Currently focused on ${stage} with ${stageProgress} progress.`,
      },
    ];

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
      response: [
        {
          question: 'Who owns this application?',
          answer: `${personalUser.firstName} ${personalUser.lastName} (${personalUser.email}).`,
        },
        {
          question: 'Why is this record seeded?',
          answer:
            'This hardcoded row is appended for the personal user defined in seed.config.json.',
        },
      ],
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
