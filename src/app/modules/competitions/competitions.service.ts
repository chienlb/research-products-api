import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Competition, CompetitionDocument } from './schema/competition.schema';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectModel(Competition.name)
    private competitionRepository: Model<CompetitionDocument>,
    private usersService: UsersService,
  ) {}

  async createCompetition(
    createCompetitionDto: CreateCompetitionDto,
  ): Promise<CompetitionDocument> {
    try {
      const user = await this.usersService.findUserById(
        createCompetitionDto.createdBy as string,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const competition = new this.competitionRepository({
        name: createCompetitionDto.name,
        description: createCompetitionDto.description,
        type: createCompetitionDto.type,
        subject: createCompetitionDto.subject,
        startTime: createCompetitionDto.startTime,
        endTime: createCompetitionDto.endTime,
      });
      await competition.save();
      return competition;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findCompetitionById(id: string): Promise<CompetitionDocument> {
    try {
      const competition = await this.competitionRepository.findById(id);
      if (!competition) {
        throw new NotFoundException('Competition not found');
      }
      return competition;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllCompetitions(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: CompetitionDocument[];
    total: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
    limit: number;
  }> {
    try {
      const competitions = await this.competitionRepository
        .find()
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await this.competitionRepository.countDocuments();
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: competitions,
        total: total,
        totalPages: totalPages,
        nextPage:
          currentPage < totalPages
            ? currentPage + 1
            : currentPage === totalPages
              ? null
              : totalPages,
        prevPage:
          currentPage > 1 ? currentPage - 1 : currentPage === 1 ? null : 1,
        limit: limit,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateCompetition(
    id: string,
    updateCompetitionDto: UpdateCompetitionDto,
  ): Promise<CompetitionDocument> {
    try {
      const competition = await this.competitionRepository.findByIdAndUpdate(
        id,
        updateCompetitionDto,
        { new: true },
      );
      if (!competition) {
        throw new NotFoundException('Competition not found');
      }
      return competition;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteCompetition(id: string): Promise<CompetitionDocument> {
    try {
      const competition =
        await this.competitionRepository.findByIdAndDelete(id);
      if (!competition) {
        throw new NotFoundException('Competition not found');
      }
      return competition;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async restoreCompetition(id: string): Promise<CompetitionDocument> {
    try {
      const competition = await this.competitionRepository.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true },
      );
      if (!competition) {
        throw new NotFoundException('Competition not found');
      }
      return competition;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findCompetitionsByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ data: CompetitionDocument[]; total: number; totalPages: number; nextPage: number | null; prevPage: number | null; limit: number }> {
    try {
      const competitions = await this.competitionRepository.find({ createdBy: new Types.ObjectId(userId) }).skip((page - 1) * limit).limit(limit);
      const total = await this.competitionRepository.countDocuments({ createdBy: new Types.ObjectId(userId) });
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      return {
        data: competitions,
        total: total,
        totalPages: totalPages,
        nextPage: currentPage < totalPages ? currentPage + 1 : currentPage === totalPages ? null : totalPages,
        prevPage: currentPage > 1 ? currentPage - 1 : currentPage === 1 ? null : 1,
        limit: limit,
      };
    }
    catch (error) {
      throw new BadRequestException(error);
    }
  }
}
