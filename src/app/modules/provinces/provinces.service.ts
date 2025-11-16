import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Province, ProvinceDocument } from './schema/province.schema';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProvincesService {
  constructor(@InjectModel(Province.name) private provinceModel: Model<ProvinceDocument>) { }

  async createProvince(createProvinceDto: CreateProvinceDto): Promise<ProvinceDocument> {
    const newProvince = new this.provinceModel(createProvinceDto);
    return await newProvince.save();
  }

  async findAllProvinces(page: number, limit: number): Promise<{ data: ProvinceDocument[], total: number, totalPages: number, nextPage: number, prevPage: number }> {
    const skip = (page - 1) * limit;
    const provinces = await this.provinceModel.find().skip(skip).limit(limit).exec();
    const total = await this.provinceModel.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    return {
      data: provinces,
      total,
      totalPages,
      nextPage: nextPage ?? page,
      prevPage: prevPage ?? page,
    };
  }

  async findProvinceById(id: string): Promise<ProvinceDocument> {
    const province = await this.provinceModel.findOne({ provinceId: id });
    if (!province) {
      throw new NotFoundException('Province not found');
    }
    return province;
  }

  async updateProvince(id: string, updateProvinceDto: UpdateProvinceDto): Promise<ProvinceDocument> {
    const updatedProvince = await this.provinceModel.findOneAndUpdate(
      { provinceId: id },
      updateProvinceDto,
      { new: true }
    );

    if (!updatedProvince) {
      throw new NotFoundException('Province not found');
    }
    return updatedProvince;
  }

  async deleteProvince(id: string): Promise<ProvinceDocument> {
    const deletedProvince = await this.provinceModel.findOneAndDelete({ provinceId: id });

    if (!deletedProvince) {
      throw new NotFoundException('Province not found');
    }
    return deletedProvince;
  }

}