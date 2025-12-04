import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Literature, LiteratureDocument } from './schema/literature.schema';
import { CreateLiteratureDto } from './dto/create-literature.dto';
import { UpdateLiteratureDto } from './dto/update-literature.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class LiteraturesService {
  constructor(
    @InjectModel(Literature.name)
    private literatureModel: Model<LiteratureDocument>,
    private usersService: UsersService,
  ) { }

  async createLiterature(
    createLiteratureDto: CreateLiteratureDto,
  ): Promise<LiteratureDocument> {
    try {
      const existingLiterature = await this.literatureModel.findOne({
        title: createLiteratureDto.title,
      });
      if (existingLiterature) {
        throw new BadRequestException('Literature already exists');
      }

      const user = await this.usersService.findUserById(
        createLiteratureDto.createdBy?.toString() || '',
      );
      if (user) {
        createLiteratureDto.createdBy = user._id;
        createLiteratureDto.updatedBy = user._id;
      }

      const createdLiterature =
        await this.literatureModel.create(createLiteratureDto);
      return createdLiterature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getLiteratures(
    page: number,
    limit: number,
  ): Promise<{
    literatures: LiteratureDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  }> {
    try {
      const literatures = await this.literatureModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await this.literatureModel.countDocuments();
      const totalPages = Math.ceil(total / limit);
      const currentPage = page;
      const hasNextPage = currentPage < totalPages;
      const hasPreviousPage = currentPage > 1;
      const nextPage = hasNextPage ? currentPage + 1 : null;
      const previousPage = hasPreviousPage ? currentPage - 1 : null;
      return {
        literatures,
        total,
        totalPages,
        currentPage,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        previousPage,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getLiteratureById(id: string): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findById(id);
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateLiterature(
    id: string,
    updateLiteratureDto: UpdateLiteratureDto,
  ): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        updateLiteratureDto,
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteLiterature(id: string): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async restoreLiterature(id: string): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changeLiteratureStatus(
    id: string,
    status: boolean,
  ): Promise<LiteratureDocument> {
    try {
      const literature = await this.literatureModel.findByIdAndUpdate(
        id,
        { isPublished: status },
        { new: true },
      );
      if (!literature) {
        throw new BadRequestException('Literature not found');
      }
      return literature;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
