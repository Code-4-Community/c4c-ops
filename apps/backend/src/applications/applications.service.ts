import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Application } from './application.entity';
import { getAppForCurrentCycle, getCurrentCycle } from './utils';
import { GetApplicationResponseDTO } from './dto/get-application.response.dto';
import { Cycle } from './dto/cycle';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: MongoRepository<Application>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(userId: number): Promise<Application[]> {
    const apps = await this.applicationsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return apps;
  }

  async findAllCurrentApplications(): Promise<GetApplicationResponseDTO[]> {
    const currentCycle: Cycle = getCurrentCycle();
    const applications = await this.applicationsRepository.find({
      where: {
        //TODO q: I had to change Cycle definition to make year and semester public. Is there a reason it was private?
        year: currentCycle.year,
        semester: currentCycle.semester,
      },
    });

    const dtos: GetApplicationResponseDTO[] = [];

    applications.forEach((app) =>
      //TODO q: what is the numApps parameter? I just passed 0 in
      dtos.push(app.toGetApplicationResponseDTO(0)),
    );

    return dtos;
  }

  async findCurrent(userId: number): Promise<Application> {
    const apps = await this.findAll(userId);
    const currentApp = getAppForCurrentCycle(apps);

    if (currentApp == null) {
      throw new BadRequestException(
        "Applicant hasn't applied in the current cycle",
      );
    }

    return currentApp;
  }
}
