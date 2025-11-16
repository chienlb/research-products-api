import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School, SchoolDocument } from './schema/school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class SchoolsService {
  constructor(@InjectModel(School.name) private schoolModel: Model<SchoolDocument>) { }

  async createSchool(createSchoolDto: CreateSchoolDto): Promise<SchoolDocument> {
    const session = await this.schoolModel.startSession();
    session.startTransaction();
    try {
      const newSchool = new this.schoolModel(createSchoolDto);
      await newSchool.save({ session });
      return newSchool;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error('Failed to create school: ' + error.message);
    }
  }

  async findAllSchools(page: number, limit: number): Promise<{ data: SchoolDocument[], total: number, totalPages: number, nextPage: number, prevPage: number }> {
    const skip = (page - 1) * limit;
    const schools = await this.schoolModel.find().skip(skip).limit(limit).exec();
    const total = await this.schoolModel.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    return {
      data: schools,
      total,
      totalPages,
      nextPage: nextPage ?? page,
      prevPage: prevPage ?? page,
    };
  }

  async findSchoolById(id: string): Promise<SchoolDocument> {
    const school = await this.schoolModel.findOne({ schoolId: id });
    if (!school) {
      throw new NotFoundException('School not found');
    }
    return school;
  }

  async updateSchool(id: string, updateSchoolDto: UpdateSchoolDto): Promise<SchoolDocument> {
    const session = await this.schoolModel.startSession();
    session.startTransaction();
    try {
      const school = await this.findSchoolById(id);
      if (!school) {
        throw new NotFoundException('School not found');
      }
      const updatedSchool = await this.schoolModel.findOneAndUpdate(
        { schoolId: id },
        updateSchoolDto,
        { new: true, session }
      );

      if (!updatedSchool) {
        throw new NotFoundException('School not found');
      }
      return updatedSchool;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error('Failed to update school: ' + error.message);
    }
  }

  async deleteSchool(id: string): Promise<SchoolDocument> {
    const session = await this.schoolModel.startSession();
    session.startTransaction();
    try {
      const school = await this.findSchoolById(id);
      if (!school) {
        throw new NotFoundException('School not found');
      }
      const deletedSchool = await this.schoolModel.findOneAndDelete({ schoolId: id }, { session });
      if (!deletedSchool) {
        throw new NotFoundException('School not found');
      }
      return deletedSchool;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error('Failed to delete school: ' + error.message);
    }
  }
}