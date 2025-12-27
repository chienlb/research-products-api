import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit, UnitDocument, UnitStatus } from './schema/unit.schema';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';
import { UnitProgressService } from '../unit-progress/unit-progress.service';


@Injectable()
export class UnitsService {
  constructor(
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UnitProgressService)) private readonly unitProgressService: UnitProgressService,
  ) { }
  async createUnit(createUnitDto: CreateUnitDto, session?: ClientSession) {
    try {
      const user = await this.usersService.findUserById(
        createUnitDto.createdBy,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const existingUnit = await this.unitModel.findOne({
        slug: createUnitDto.name,
      });
      if (existingUnit) {
        throw new BadRequestException('Unit already exists');
      }
      const newUnit = new this.unitModel({
        ...createUnitDto,
        createdBy: user._id,
        updatedBy: user._id,
      });
      await newUnit.save({ session });
      return newUnit;
    } catch (error) {
      throw new Error('Failed to create unit: ' + error.message);
    }
  }

  async findAllUnits(paginationDto: PaginationDto, session?: ClientSession) {
    try {
      const cacheKey = `units:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const units = await this.unitModel
        .find({ isActive: UnitStatus.ACTIVE })
        .skip((paginationDto.page - 1) * paginationDto.limit)
        .limit(paginationDto.limit)
        .session(session || null);
      const result = {
        data: units,
        page: paginationDto.page,
        limit: paginationDto.limit,
        total: units.length,
        totalPages: Math.ceil(units.length / paginationDto.limit),
        nextPage: paginationDto.page < Math.ceil(units.length / paginationDto.limit) ? paginationDto.page + 1 : null,
        prevPage: paginationDto.page > 1 ? paginationDto.page - 1 : null,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new Error('Failed to find all units: ' + error.message);
    }
  }

  async findUnitById(id: string, session?: ClientSession) {
    const cacheKey = `unit:id=${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const unit = await this.unitModel.findById(id).session(session || null);
    return unit;
  }

  async updateUnitById(
    id: string,
    updateUnitDto: UpdateUnitDto,
    session?: ClientSession,
  ) {
    try {
      const unit = await this.unitModel
        .findByIdAndUpdate(id, updateUnitDto, { session })
        .session(session || null);
      return unit;
    } catch (error) {
      throw new Error('Failed to update unit: ' + error.message);
    }
  }

  async deleteUnitById(id: string, session?: ClientSession) {
    try {
      const unit = await this.unitModel
        .findByIdAndUpdate(id, { isActive: UnitStatus.INACTIVE }, { session })
        .session(session || null);
      return unit;
    } catch (error) {
      throw new Error('Failed to delete unit: ' + error.message);
    }
  }

  async restoreUnitById(id: string, session?: ClientSession) {
    try {
      const unit = await this.unitModel
        .findByIdAndUpdate(id, { isActive: UnitStatus.ACTIVE }, { session })
        .session(session || null);
      return unit;
    } catch (error) {
      throw new Error('Failed to restore unit: ' + error.message);
    }
  }

  async getUnitByUserId(userId: string, orderIndex: number, unitId: string, session?: ClientSession) {
    try {
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const unitProgress = await this.unitProgressService.findUnitByUserId(userId, orderIndex - 1, unitId);
      if (!unitProgress) {
        throw new NotFoundException('Unit progress not found');
      }
      const unit = await this.unitModel.findById(unitProgress.unitId).session(session || null);
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      return unit;
    } catch (error) {
      throw new Error('Failed to get unit by user id: ' + error.message);
    }
  }
}
