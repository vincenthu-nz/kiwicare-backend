import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDto, PostsRo } from './dto/post.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/role.guard';

@ApiTags('Posts')
@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Create a new post' })
  @ApiBearerAuth()
  @Post()
  @Roles('admin', 'root')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(@Body() post: CreatePostDto, @Req() req) {
    return await this.postsService.create(req.user, post);
  }

  @ApiOperation({ summary: 'Get post list' })
  @Get('/list')
  async findAll(@Query() query): Promise<PostsRo> {
    return await this.postsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get archive date list' })
  @Get('/archives')
  getArchives() {
    return this.postsService.getArchives();
  }

  @ApiOperation({ summary: 'Get post archives' })
  @Get('/archives/list')
  getArchiveList(@Query('time') time: string) {
    return this.postsService.getArchiveList(time);
  }

  @ApiOperation({ summary: 'Get specific post' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.postsService.findById(id);
  }

  @ApiOperation({ summary: 'Update specific post' })
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: number, @Body() post: CreatePostDto) {
    return await this.postsService.updateById(id, post);
  }

  @ApiOperation({ summary: 'Delete post' })
  @Delete(':id')
  async remove(@Param('id') id) {
    return await this.postsService.remove(id);
  }
}
