import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schema/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ClassesService {
  constructor(@InjectModel(Class.name) private classModel: Model<ClassDocument>) { }

  async createClass(createClassDto: CreateClassDto): Promise<ClassDocument> {
    try {
      const newClass = new this.classModel(createClassDto);
      await newClass.save();
      return newClass;
    } catch (error) {
      throw new Error('Failed to create class: ' + error.message);
    }
  }

  async findAllClasses(page: number, limit: number): Promise<{ data: ClassDocument[], total: number, totalPages: number, nextPage: number, prevPage: number }> {
    const skip = (page - 1) * limit;
    const classes = await this.classModel.find().skip(skip).limit(limit).exec();
    const total = await this.classModel.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    return { data: classes, total, totalPages, nextPage: nextPage ?? page, prevPage: prevPage ?? page };
  }

  async findClassById(id: string): Promise<ClassDocument> {
    const classResult = await this.classModel.findOne({ classId: id });
    if (!classResult) {
      throw new NotFoundException('Class not found');
    }
    return classResult;
  }

  async updateClass(id: string, updateClassDto: UpdateClassDto): Promise<ClassDocument> {
    try {
      const classResult = await this.findClassById(id);
      if (!classResult) {
        throw new NotFoundException('Class not found');
      }
      const updatedClass = await this.classModel.findOneAndUpdate(
        { classId: id },
        updateClassDto,
        { new: true }
      );
      if (!updatedClass) {
        throw new NotFoundException('Class not found');
      }
      return updatedClass;
    } catch (error) {
      throw new Error('Failed to update class: ' + error.message);
    }
  }

  async deleteClass(id: string): Promise<ClassDocument> {
    try {
      const classResult = await this.findClassById(id);
      if (!classResult) {
        throw new NotFoundException('Class not found');
      }
      const deletedClass = await this.classModel.findOneAndDelete({ classId: id });
      if (!deletedClass) {
        throw new NotFoundException('Class not found');
      }
      return deletedClass;
    }
    catch (error) {
      throw new Error('Failed to delete class: ' + error.message);
    }
  }
}