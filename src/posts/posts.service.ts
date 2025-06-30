import { CategoryService } from '../category/category.service';
import { CreatePostDto, PostsRo } from './dto/post.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from './posts.entity';
import { TagService } from '../tag/tag.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
  ) {}

  async create(user: any, postDto: CreatePostDto): Promise<number> {
    const { title, tag, category = 0, status, isRecommend } = postDto;

    if (!title) {
      throw new HttpException('Missing post title', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.postsRepository.findOne({ where: { title } });
    if (existing) {
      throw new HttpException(
        'Post with this title already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const categoryEntity = await this.categoryService.findById(category);
    const tags = await this.tagService.findByIds(String(tag).split(','));

    const postData: Partial<PostsEntity> = {
      ...postDto,
      isRecommend: isRecommend,
      category: categoryEntity,
      tags,
      author: user,
      publishTime: status === 'publish' ? new Date() : undefined,
    };

    const newPost = this.postsRepository.create(postData);
    const created = await this.postsRepository.save(newPost);
    return created.id;
  }

  async findAll(query: any): Promise<PostsRo> {
    const { pageNum = 1, pageSize = 10 } = query;

    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'user')
      .where('1 = 1')
      .orderBy('post.create_time', 'DESC')
      .skip((pageNum - 1) * pageSize)
      .take(pageSize);

    const [posts, count] = await qb.getManyAndCount();
    const result = posts.map((item) => item.toResponseObject());
    return { list: result, count };
  }

  async findById(id: string): Promise<any> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'user')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new HttpException(
        `Post with id ${id} does not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.postsRepository.update(id, { count: post.count + 1 });
    return post.toResponseObject();
  }

  async updateById(id: number, postDto: CreatePostDto): Promise<number> {
    const existingPost = await this.postsRepository.findOne({ where: { id } });
    if (!existingPost) {
      throw new HttpException(
        `Post with id ${id} does not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { category, tag, status } = postDto;
    const tags = await this.tagService.findByIds(String(tag).split(','));
    const categoryEntity = await this.categoryService.findById(category);

    const updatedData: Partial<PostsEntity> = {
      ...postDto,
      isRecommend: postDto.isRecommend,
      category: categoryEntity,
      tags,
      publishTime: status === 'publish' ? new Date() : existingPost.publishTime,
    };

    const merged = this.postsRepository.merge(existingPost, updatedData);
    return (await this.postsRepository.save(merged)).id;
  }

  async updateViewById(id: number): Promise<void> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (post) {
      post.count += 1;
      await this.postsRepository.save(post);
    }
  }

  async getArchives(): Promise<any[]> {
    return await this.postsRepository
      .createQueryBuilder('post')
      .select([
        `DATE_FORMAT(update_time, '%Y-%m') AS time`,
        `COUNT(*) AS count`,
      ])
      .where('status = :status', { status: 'publish' })
      .groupBy('time')
      .orderBy('update_time', 'DESC')
      .getRawMany();
  }

  async getArchiveList(time: string): Promise<any[]> {
    return await this.postsRepository
      .createQueryBuilder('post')
      .where('status = :status', { status: 'publish' })
      .andWhere(`DATE_FORMAT(update_time, '%Y-%m') = :time`, { time })
      .orderBy('update_time', 'DESC')
      .getRawMany();
  }

  async remove(id: number): Promise<void> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new HttpException(
        `Post with id ${id} does not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.postsRepository.remove(post);
  }
}
