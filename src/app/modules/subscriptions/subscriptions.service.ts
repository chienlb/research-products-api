import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schema/subscription.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      const newSubscription = new this.subscriptionModel(createSubscriptionDto);
      return await newSubscription.save();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new InternalServerErrorException('Error creating subscription');
    }
  }

  async findAll() {
    try {
      return await this.subscriptionModel.find().exec();
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw new InternalServerErrorException('Error fetching subscriptions');
    }
  }

  async findOne(id: string) {
    try {
      const subscription = await this.subscriptionModel.findById(id).exec();
      if (!subscription) {
        throw new NotFoundException(`Subscription with id ${id} not found`);
      }
      return subscription;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      if (error instanceof NotFoundException) {
        throw error; 
      }
      throw new InternalServerErrorException('Error fetching subscription');
    }
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    try {
      const updatedSubscription = await this.subscriptionModel
        .findByIdAndUpdate(id, updateSubscriptionDto, { new: true })
        .exec();
      if (!updatedSubscription) {
        throw new NotFoundException(`Subscription with id ${id} not found`);
      }
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      if (error instanceof NotFoundException) {
        throw error; 
      }
      throw new InternalServerErrorException('Error updating subscription');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.subscriptionModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException(`Subscription with id ${id} not found`);
      }

      return { message: `Subscription with id ${id} has been removed` };
    } catch (error) {
      console.error('Error removing subscription:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error removing subscription');
    }
  }


}
