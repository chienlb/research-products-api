import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Purchase,
  PurchaseDocument,
  PurchaseStatus,
} from './schema/purchase.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { UsersService } from '../users/users.service';
import { PackagesService } from '../packages/packages.service';
import { PaymentsService } from '../payments/payments.service';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../pagination/pagination.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name)
    private purchaseRepository: Model<PurchaseDocument>,
    private usersService: UsersService,
    private packagesService: PackagesService,
    private paymentsService: PaymentsService,
    private readonly redisService: RedisService,
  ) { }

  async createPurchase(
    createPurchaseDto: CreatePurchaseDto,
  ): Promise<PurchaseDocument> {
    try {
      const user = await this.usersService.findUserById(
        createPurchaseDto.userId,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const packageItem = await this.packagesService.findPackageById(
        createPurchaseDto.packageId,
      );
      if (!packageItem) {
        throw new NotFoundException('Package not found');
      }
      const purchase = new this.purchaseRepository(createPurchaseDto);
      return await purchase.save();
    } catch (error) {
      throw new Error(
        'Failed to create purchase: ' + (error?.message || error),
      );
    }
  }

  async findPurchaseById(id: string): Promise<PurchaseDocument> {
    try {
      const purchase = await this.purchaseRepository.findById(id);
      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }
      return purchase;
    } catch (error) {
      throw new Error('Failed to find purchase: ' + (error?.message || error));
    }
  }

  async findAllPurchases(paginationDto: PaginationDto): Promise<{
    data: PurchaseDocument[];
    total: number;
    totalPages: number;
    nextPage: number;
    prevPage: number;
  }> {
    try {
      const cacheKey = `purchases:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const skip = (paginationDto.page - 1) * paginationDto.limit;
      const purchases = await this.purchaseRepository
        .find({ isActive: true })
        .skip(skip)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 })
        .exec();
      const total = await this.purchaseRepository.countDocuments({
        isActive: true,
      });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const nextPage =
        paginationDto.page < totalPages ? paginationDto.page + 1 : null;
      const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;
      const result = {
        data: purchases,
        total,
        totalPages,
        nextPage: nextPage ?? paginationDto.page,
        prevPage: prevPage ?? paginationDto.page,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new Error(
        'Failed to find all purchases: ' + (error?.message || error),
      );
    }
  }

  async findPurchasesByUserId(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: PurchaseDocument[];
    total: number;
    totalPages: number;
    nextPage: number;
    prevPage: number;
  }> {
    try {
      const cacheKey = `purchases:user-id=${userId}:page=${paginationDto.page}:limit=${paginationDto.limit}:sort=${paginationDto.sort}:order=${paginationDto.order}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const skip = (paginationDto.page - 1) * paginationDto.limit;
      const purchases = await this.purchaseRepository
        .find({ userId })
        .skip(skip)
        .limit(paginationDto.limit)
        .sort({ [paginationDto.sort]: paginationDto.order === 'asc' ? 1 : -1 })
        .exec();
      const total = await this.purchaseRepository.countDocuments({ userId });
      const totalPages = Math.ceil(total / paginationDto.limit);
      const nextPage =
        paginationDto.page < totalPages ? paginationDto.page + 1 : null;
      const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;
      const result = {
        data: purchases,
        total,
        totalPages,
        nextPage: nextPage ?? paginationDto.page,
        prevPage: prevPage ?? paginationDto.page,
      };
      await this.redisService.set(cacheKey, JSON.stringify(result), 60 * 5);
      return result;
    } catch (error) {
      throw new Error(
        'Failed to find purchases by user id: ' + (error?.message || error),
      );
    }
  }

  async updatePurchase(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<PurchaseDocument> {
    try {
      const purchase = await this.purchaseRepository.findByIdAndUpdate(
        id,
        updatePurchaseDto,
        { new: true },
      );
      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }
      return purchase;
    } catch (error) {
      throw new Error(
        'Failed to update purchase: ' + (error?.message || error),
      );
    }
  }

  async deletePurchase(id: string): Promise<void> {
    try {
      const purchase = await this.purchaseRepository.findByIdAndDelete(id);
      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }
    } catch (error) {
      throw new Error(
        'Failed to delete purchase: ' + (error?.message || error),
      );
    }
  }

  async verifyPurchase(id: string): Promise<void> {
    try {
      const purchase = await this.purchaseRepository.findById(id);
      if (!purchase) {
        throw new NotFoundException('Purchase not found');
      }
      if (purchase.status !== PurchaseStatus.PENDING) {
        throw new BadRequestException('Purchase already verified');
      }
      purchase.status = PurchaseStatus.SUCCESS;
      await purchase.save();
    } catch (error) {
      throw new Error(
        'Failed to verify purchase: ' + (error?.message || error),
      );
    }
  }
}
