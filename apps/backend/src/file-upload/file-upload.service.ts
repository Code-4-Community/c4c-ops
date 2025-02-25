import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { ApplicationsService } from '../applications/applications.service';
import 'multer';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileRepository: Repository<FileUpload>,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async handleFileUpload(file: Express.Multer.File, applicationId: number) {
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
      filename: file.originalname, // assuming file name is passed in the request
      mimetype: file.mimetype, // assuming mime type is passed in the request
      size: file.size, // assuming size is passed in the request
      file_data: file.buffer, // the raw buffer from the request
      application: application,
    });

    await this.fileRepository.save(uploadedFile);

    console.log('File uploaded:', uploadedFile);
    return { message: 'File uploaded successfully', fileId: uploadedFile.id };
  }
}
