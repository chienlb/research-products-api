import { Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UnitProgress, UnitProgressDocument } from './schema/unit-progress.schema';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { UnitsService } from '../units/units.service';
import { CreateUnitProgressDto } from './dto/create-unit-progress.dto';
import { Unit, UnitDocument } from '../units/schema/unit.schema';

@Injectable()
export class UnitProgressService {
  constructor(
    @InjectModel(UnitProgress.name) private unitProgressModel: Model<UnitProgressDocument>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => UnitsService)) private readonly unitsService: UnitsService,
    @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
  ) { }

  async createUnitProgress(createUnitProgressDto: CreateUnitProgressDto): Promise<UnitProgressDocument> {
    try {
      const user = await this.usersService.findUserById(createUnitProgressDto.userId.toString());
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const unit = await this.unitModel.findById(createUnitProgressDto.unitId);
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      const unitProgress = new this.unitProgressModel({ ...createUnitProgressDto, unitId: unit._id });
      return unitProgress.save();
    } catch (error) {
      throw new Error('Failed to create unit progress: ' + error.message);
    }
  }

  async findUnitByUserId(userId: string, orderIndex: number, unitId: string): Promise<UnitProgressDocument> {
    try {
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const unitProgress = await this.unitProgressModel.findOne({ userId: user._id, orderIndex: orderIndex, unitId: unitId });
      if (!unitProgress) {
        throw new NotFoundException('Unit progress not found');
      }
      return unitProgress;
    } catch (error) {
      throw new Error('Failed to find unit by user id: ' + error.message);
    }
  }
}
