import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Package, PackageDocument } from './schema/package.schema'; 
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
  ) {}

  async create(createPackageDto: CreatePackageDto) {
    try {
      const createdPackage = new this.packageModel(createPackageDto);
      return await createdPackage.save();
    } catch (error) {
      console.error('Error creating package:', error);
      throw new InternalServerErrorException('Error creating package');
    }
  }

  async findAll() {
    try {
      return await this.packageModel.find().exec();
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw new InternalServerErrorException('Error fetching packages');
    }
  }

  async findOne(id: string) {
    try {
      const packageEntity = await this.packageModel.findById(id).exec();
      if (!packageEntity) {
        throw new NotFoundException(`Package with id ${id} not found`);
      }
      return packageEntity;
    } catch (error) {
      console.error('Error fetching package:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching package');
    }
  }

  async update(id: string, updatePackageDto: UpdatePackageDto) {
    try {
      const updatedPackage = await this.packageModel
        .findByIdAndUpdate(id, updatePackageDto, { new: true })
        .exec();
      if (!updatedPackage) {
        throw new NotFoundException(`Package with id ${id} not found`);
      }
      return updatedPackage;
    } catch (error) {
      console.error('Error updating package:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating package');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.packageModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Package with id ${id} not found`);
      }
      return { message: `Package with id ${id} has been removed` };
    } catch (error) {
      console.error('Error removing package:', error);
      throw new InternalServerErrorException('Error removing package');
    }
  }
}
