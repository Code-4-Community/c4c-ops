import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { BadRequestException } from '@nestjs/common';

describe('FileUploadController', () => {
  let controller: FileUploadController;
  let service: FileUploadService;

  const mockFile = {
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  const mockService = {
    handleFileUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [{ provide: FileUploadService, useValue: mockService }],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
    service = module.get<FileUploadService>(FileUploadService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.handleFileUpload and return result', async () => {
    const result = { message: 'File uploaded successfully', fileId: 1 };
    mockService.handleFileUpload.mockResolvedValue(result);
    const response = await controller.uploadFile(mockFile, 123);
    expect(service.handleFileUpload).toHaveBeenCalledWith(mockFile, 123);
    expect(response).toEqual(result);
  });

  it('should throw BadRequestException if applicationId is missing', async () => {
    await expect(
      controller.uploadFile(mockFile, undefined as unknown as number),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid file type or file too large', async () => {
    // Invalid file type
    const invalidTypeFile = {
      ...mockFile,
      mimetype: 'text/plain',
      originalname: 'test.txt',
    };
    mockService.handleFileUpload.mockImplementation(() => {
      throw new BadRequestException('Invalid file type');
    });
    await expect(controller.uploadFile(invalidTypeFile, 123)).rejects.toThrow(
      BadRequestException,
    );

    // File too large
    const largeFile = { ...mockFile, size: 13 * 1024 * 1024 };
    mockService.handleFileUpload.mockImplementation(() => {
      throw new BadRequestException('File is too large!');
    });
    await expect(controller.uploadFile(largeFile, 123)).rejects.toThrow(
      BadRequestException,
    );
  });
});
