import {
  Controller,
  Post,
  Param,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import 'multer';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post(':applicationId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('applicationId') applicationId: number,
  ) {
    if (!applicationId) {
      throw new BadRequestException('Application ID is required');
    }
    console.log('Received file in controller:', file);
    return this.fileUploadService.handleFileUpload(file, applicationId);
  }
}
