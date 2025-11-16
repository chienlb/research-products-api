import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { District, DistrictDocument } from './schema/district.schema';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class DistrictsService {
  constructor(@InjectModel(District.name) private districtModel: Model<DistrictDocument>) { }

  async createDistrict(createDistrictDto: CreateDistrictDto): Promise<DistrictDocument> {
    const newDistrict = new this.districtModel(createDistrictDto);
    return await newDistrict.save();
  }

  async findAllDistricts(page: number, limit: number): Promise<{ data: DistrictDocument[], total: number, totalPages: number, nextPage: number, prevPage: number }> {
    const skip = (page - 1) * limit;
    const districts = await this.districtModel.find().skip(skip).limit(limit).exec();
    const total = await this.districtModel.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    return {
      data: districts,
      total,
      totalPages,
      nextPage: nextPage ?? page,
      prevPage: prevPage ?? page,
    };
  }

  async findDistrictById(id: string): Promise<DistrictDocument> {
    const district = await this.districtModel.findOne({ districtId: id });
    if (!district) {
      throw new NotFoundException('District not found');
    }
    return district;
  }

  async updateDistrict(id: string, updateDistrictDto: UpdateDistrictDto): Promise<DistrictDocument> {
    const updatedDistrict = await this.districtModel.findOneAndUpdate(
      { districtId: id },
      updateDistrictDto,
      { new: true }
    );
    if (!updatedDistrict) {
      throw new NotFoundException('District not found');
    }
    return updatedDistrict;
  }

  async deleteDistrict(id: string): Promise<DistrictDocument> {
    const deletedDistrict = await this.districtModel.findOneAndDelete({ districtId: id });
    if (!deletedDistrict) {
      throw new NotFoundException('District not found');
    }
    return deletedDistrict;
  }
}