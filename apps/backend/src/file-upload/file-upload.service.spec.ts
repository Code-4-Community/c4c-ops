import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';

const mockFileRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

const mockApplicationsService = {
  findCurrent: jest.fn(),
};

describe('FileUploadService', () => {
  let service: FileUploadService;
  let fileRepository: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: getRepositoryToken(FileUpload),
          useFactory: mockFileRepository,
        },
        { provide: ApplicationsService, useValue: mockApplicationsService },
      ],
    })
      .overrideProvider(ApplicationsService)
      .useValue(mockApplicationsService)
      .compile();

    service = module.get<FileUploadService>(FileUploadService);
    fileRepository = module.get(getRepositoryToken(FileUpload));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle pdf file upload', async () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    const applicationId = 123;
    const fakeApplication = { id: applicationId };
    const fakeFile = { id: 1 };
    mockApplicationsService.findCurrent.mockResolvedValue(fakeApplication);
    fileRepository.create.mockReturnValue(fakeFile);
    fileRepository.save.mockResolvedValue(fakeFile);
    const result = await service.handleFileUpload(mockFile, applicationId);
    expect(result).toHaveProperty('message', 'File uploaded successfully');
    expect(result).toHaveProperty('fileId', 1);
  });

  it('should handle msword file upload', async () => {
    const mockFile = {
      originalname: 'test.DOCX',
      mimetype: 'application/msword',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    const applicationId = 123;
    const fakeApplication = { id: applicationId };
    const fakeFile = { id: 1 };
    mockApplicationsService.findCurrent.mockResolvedValue(fakeApplication);
    fileRepository.create.mockReturnValue(fakeFile);
    fileRepository.save.mockResolvedValue(fakeFile);
    const result = await service.handleFileUpload(mockFile, applicationId);
    expect(result).toHaveProperty('message', 'File uploaded successfully');
    expect(result).toHaveProperty('fileId', 1);
  });

  it('should throw if no file is uploaded', async () => {
    await expect(
      service.handleFileUpload(undefined as unknown as Express.Multer.File, 1),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if file type is invalid', async () => {
    const mockFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    await expect(service.handleFileUpload(mockFile, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if file is too large', async () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 13 * 1024 * 1024, // 13MB
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    await expect(service.handleFileUpload(mockFile, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if application not found', async () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    mockApplicationsService.findCurrent.mockResolvedValue(undefined);
    await expect(service.handleFileUpload(mockFile, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw if file is too large and type is invalid', async () => {
    const mockFile = {
      originalname: 'test.exe',
      mimetype: 'application/x-msdownload',
      size: 20 * 1024 * 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    await expect(service.handleFileUpload(mockFile, 1)).rejects.toThrow(
      BadRequestException,
    );
  });
});
