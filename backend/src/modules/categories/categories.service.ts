import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const cat = await this.repo.findOneBy({ id });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return cat;
  }

  create(dto: CreateCategoryDto) {
    const category = this.repo.create(dto);
    return this.repo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    return this.repo.remove(cat);
  }
}
