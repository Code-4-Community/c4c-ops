import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdateUserDTO } from './update-user.dto';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch(':userId')
  async updateUser(
    @Body() updateUserDTO: UpdateUserDTO,
    @Param('userId') userId: string,
  ): Promise<User> {
    return this.usersService.updateUser(updateUserDTO, userId);
  }
}
