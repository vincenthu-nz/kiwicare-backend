import { TagEntity } from '../tag/entities/tag.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { PostInfoDto } from './dto/post.dto';

@Entity('post')
export class PostsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'text', default: null })
  content: string;

  @Column({ type: 'text', default: null, name: 'content_html' })
  contentHtml: string;

  @Column({ type: 'text', default: null })
  summary: string;

  @Column({ default: null, name: 'cover_url' })
  coverUrl: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ type: 'int', default: 0, name: 'like_count' })
  likeCount: number;

  @Column({ type: 'boolean', default: false, name: 'is_recommend' })
  isRecommend: boolean;

  @Column('simple-enum', { enum: ['draft', 'publish'] })
  status: string;

  @ManyToOne(() => User, (user) => user.name)
  author: User;

  @Exclude()
  @ManyToOne(() => CategoryEntity, (category) => category.posts, {
    // cascade: true,
  })
  @JoinColumn({
    name: 'category_id',
  })
  category: CategoryEntity;

  @ManyToMany(() => TagEntity, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tag',
    joinColumns: [{ name: 'post_id' }],
    inverseJoinColumns: [{ name: 'tag_id' }],
  })
  tags: TagEntity[];

  @Column({ type: 'timestamp', name: 'publish_time', default: null })
  publishTime: Date;

  @Column({
    type: 'timestamp',
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;

  @Column({
    type: 'timestamp',
    name: 'update_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateTime: Date;

  @Column({ type: 'text', nullable: true })
  toc: string;

  toResponseObject(): PostInfoDto {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      contentHtml: this.contentHtml,
      summary: this.summary,
      coverUrl: this.coverUrl,
      isRecommend: this.isRecommend,
      status: this.status,
      userId: this.author?.id ?? '',
      author: this.author?.name || this.author?.name || '',
      category: this.category?.name ?? '',
      tags: this.tags?.map((tag) => tag.name) ?? [],
      count: this.count,
      likeCount: this.likeCount,
      toc: this.toc,
    };
  }
}
