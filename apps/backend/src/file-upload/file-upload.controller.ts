import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { FileUploadService } from './file-upload.service';
import { FileType } from './entities/file-upload.entity';
import 'multer';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post(':applicationId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('applicationId') applicationId: number,
    @Query('fileType') fileType: FileType = FileType.MATERIALS,
  ) {
    if (!applicationId) {
      throw new BadRequestException('Application ID is required');
    }

    if (fileType && !Object.values(FileType).includes(fileType)) {
      throw new BadRequestException('Invalid file type');
    }

    return this.fileUploadService.handleFileUpload(
      file,
      applicationId,
      fileType,
    );
  }

  @Get('download/:applicantId/:fileType')
  @UseGuards(AuthGuard('jwt'))
  async downloadFile(
    @Param('applicantId') applicantId: number,
    @Param('fileType') fileType: FileType,
    @Res() res: Response,
  ) {
    if (!applicantId) {
      throw new BadRequestException('Applicant ID is required');
    }

    if (!Object.values(FileType).includes(fileType)) {
      throw new BadRequestException('Invalid file type');
    }

    try {
      const { file, applicantName } =
        await this.fileUploadService.downloadFileByType(applicantId, fileType);

      const fileExtension = file.filename.split('.').pop() || 'pdf';
      const downloadFilename = `${applicantName}_${fileType}.${fileExtension}`;

      res.setHeader('Content-Type', file.mimetype);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${downloadFilename}"`,
      );
      res.setHeader('Content-Length', file.size);

      res.send(file.file_data);
    } catch (error) {
      console.error('Download error:', error);
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  @Get('available-types/:applicantId')
  @UseGuards(AuthGuard('jwt'))
  async getAvailableFileTypes(
    @Param('applicantId') applicantId: number,
  ): Promise<{ availableTypes: FileType[] }> {
    if (!applicantId) {
      throw new BadRequestException('Applicant ID is required');
    }

    const availableTypes = await this.fileUploadService.getAvailableFileTypes(
      applicantId,
    );
    return { availableTypes };
  }
}
