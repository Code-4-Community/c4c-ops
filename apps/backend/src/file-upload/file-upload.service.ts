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
    const application = await this.applicationsService.findOne(applicationId);
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

  /**
   * Get all uploaded files by user ID
   * @param userId - The ID of the user
   * @param includeFileData - Whether to include the actual file buffer data (default: false)
   * @returns Array of file upload records for the user
   */
  async getUserFiles(userId: number, includeFileData = false) {
    try {
      const queryBuilder = this.fileRepository
        .createQueryBuilder('file')
        .leftJoin('file.application', 'application')
        .where('application.user = :userId', { userId });

      // Conditionally select file_data based on includeFileData parameter
      if (!includeFileData) {
        queryBuilder.select([
          'file.id',
          'file.filename',
          'file.mimetype',
          'file.size',
          'application.id',
        ]);
      } else {
        queryBuilder.addSelect('file.file_data');
      }

      const files = await queryBuilder.getMany();

      if (!files || files.length === 0) {
        return {
          message: 'No files found for this user',
          files: [],
          total: 0,
        };
      }

      return {
        message: 'Files retrieved successfully',
        files: files.map((file) => ({
          id: file.id,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          ...(includeFileData && { file_data: file.file_data }),
          applicationId: file.application?.id,
        })),
        total: files.length,
      };
    } catch (error) {
      console.error('Error retrieving user files:', error);
      throw new BadRequestException('Failed to retrieve user files');
    }
  }
}
