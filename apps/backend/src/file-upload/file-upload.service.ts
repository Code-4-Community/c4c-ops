import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload, FileType } from './entities/file-upload.entity';
import { ApplicationsService } from '../applications/applications.service';
import 'multer';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileRepository: Repository<FileUpload>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async handleFileUpload(
    file: Express.Multer.File,
    applicationId: number,
    fileType: FileType = FileType.MATERIALS,
  ) {
    console.log('Received file:', file);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    // Validate file size (12 MB)
    const maxSize = 12 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File is too large!');
    }

    // Check if the application exists
    const application = await this.applicationsService.findCurrent(
      applicationId,
    );
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Save file to the database
    const uploadedFile = this.fileRepository.create({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      file_data: file.buffer,
      file_type: fileType,
      application: application,
    });

    await this.fileRepository.save(uploadedFile);

    console.log('File uploaded:', uploadedFile);
    return { message: 'File uploaded successfully', fileId: uploadedFile.id };
  }

  async downloadFileByType(
    applicantId: number,
    fileType: FileType,
  ): Promise<{ file: FileUpload; applicantName: string }> {
    const application = await this.applicationsService.findCurrent(applicantId);
    if (!application) {
      throw new NotFoundException('Application not found for this applicant');
    }

    const file = await this.fileRepository.findOne({
      where: {
        application: { id: application.id },
        file_type: fileType,
      },
      relations: ['application', 'application.user'],
    });

    if (!file) {
      throw new NotFoundException(
        `No ${fileType} file found for this applicant`,
      );
    }

    if (!file.application?.user) {
      throw new NotFoundException('User information not found for this file');
    }

    const { firstName, lastName } = file.application.user;
    if (!firstName || !lastName) {
      throw new NotFoundException('User name information is incomplete');
    }

    const applicantName = `${firstName}${lastName}`;
    return { file, applicantName };
  }

  async getAvailableFileTypes(applicantId: number): Promise<FileType[]> {
    const application = await this.applicationsService.findCurrent(applicantId);
    if (!application) {
      throw new NotFoundException('Application not found for this applicant');
    }

    const files = await this.fileRepository.find({
      where: {
        application: { id: application.id },
      },
      select: ['file_type'],
    });

    return files.map((file) => file.file_type);
  }
}
