import {
  Controller,
  Post,
  Param,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Query,
  Get,
  ParseIntPipe,
  Body,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileUploadService } from './file-upload.service';
import 'multer';
import { FilePurpose } from '@shared/types/file-upload.types';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post(':applicationId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('applicationId') applicationId: number,
    @Body('purpose') purpose: FilePurpose,
  ) {
    if (!applicationId) {
      throw new BadRequestException('Application ID is required');
    }
    console.log('Received file in controller:', file);
    return this.fileUploadService.handleFileUpload(
      file,
      applicationId,
      purpose,
    );
  }

  @Get('user/:userId')
  async getUserFiles(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('includeFileData') includeFileData?: string,
  ) {
    const includeData = includeFileData === 'true';
    return this.fileUploadService.getUserFiles(userId, includeData);
  }

  @Get('download/:fileId')
  async downloadFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.fileUploadService.getFileById(fileId);

    // Set response headers for file download
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.size,
    });

    return new StreamableFile(file.file_data);
  }
}
