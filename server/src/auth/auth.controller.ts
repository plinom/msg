import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { IUserLogin } from 'src/classes/users.classes';
import { User } from 'src/decorators/user.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiBearerAuth()
@ApiTags('login')
@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  @ApiBody({ type: IUserLogin })
  @ApiOperation({ summary: 'Login JWT strategy' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Mail not confirmed' })
  @ApiResponse({ status: 404, description: 'Permission denied' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Login success' })
  async jwtLogin(@Body() data: IUserLogin, @Res() res: Response) {
    try {
      const { access_token } = await this.authService.login(data);
      return res
        .cookie('access_token', access_token, {
          httpOnly: true,
          maxAge: 30000,
          secure: false,
          path: '/',
          sameSite: 'lax',
        })
        .json({
          message: 'Login success',
        });
    } catch (err) {
      return res.status(err.status).json({ message: err.response });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get user profile with' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 404, description: 'Access token not found' })
  async jwtGetProfile(@User() user: typeof User, @Res() res: Response) {
    try {
      return res.json({ message: user });
    } catch (err) {
      return res.status(err.status).json({ message: err.response });
    }
  }
}
