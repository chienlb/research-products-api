import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  User,
  UserDocument,
  UserRole,
  UserTypeAccount,
} from './schema/user.schema';
import mongoose, { ClientSession, Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { InvitationCodeType } from '../invitation-codes/schema/invitation-code.schema';
import { InvitationCodesService } from '../invitation-codes/invitation-codes.service';
import { PackageType } from '../packages/schema/package.schema';
import { PaginationDto } from '../pagination/pagination.dto';

import { RedisService } from 'src/app/configs/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => InvitationCodesService))
    private readonly invitationCodesService: InvitationCodesService,
    private readonly redisService: RedisService,
    @InjectConnection() private readonly connection: Connection,
  ) { }
  async createUser(createUserDto: CreateUserDto, session?: ClientSession): Promise<UserDocument> {
    if (this.connection.readyState !== 1) {
      throw new BadRequestException('Database not ready.');
    }

    const mongooseSession = session ?? (await this.connection.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      mongooseSession.startTransaction();
    }
    try {
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      }).session(mongooseSession);
      if (existingUser) {
        throw new ConflictException('Email or username already exists');
      }
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      await newUser.save({ session: mongooseSession });

      if (
        createUserDto.role !== UserRole.STUDENT &&
        newUser.accountPackage !== PackageType.FREE
      ) {
        const invitationCode =
          await this.invitationCodesService.createInvitationCode(
            {
              createdBy: newUser._id.toString(),
              event: 'Invitation code for student registration',
              description: `Invitation code created by ${newUser.username}`,
              type: InvitationCodeType.GROUP_JOIN,
              totalUses: 0,
              usesLeft: 100,
              startedAt: new Date().toISOString(),
            },
            mongooseSession,
          );
        if (!invitationCode.data) {
          throw new BadRequestException('Failed to create invitation code');
        }
        if (isNewSession) {
          await mongooseSession.commitTransaction();
        }
        return newUser;
      }

      if (isNewSession) {
        await mongooseSession.commitTransaction();
      }
      return newUser;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
      }
      throw new Error('Failed to create user: ' + error.message);
    } finally {
      if (isNewSession) {
        await mongooseSession.endSession();
      }
    }
  }

  async findAllUsers(
    paginationDto: PaginationDto,
    session?: ClientSession,
  ): Promise<{
    data: UserDocument[];
    total: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
    page: number;
    limit: number;
  }> {
    const { page, limit, sort, order } = paginationDto;

    const cacheKey = `users:page=${page}:limit=${limit}:sort=${sort}:order=${order}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find({ isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .session(session || null)
        .lean(),

      this.userModel.countDocuments({ isDeleted: false }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      data: users as UserDocument[],
      total,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      page,
      limit,
    };

    await this.redisService.set(
      cacheKey,
      JSON.stringify(result),
      60 * 5,
    );

    return result;
  }


  async findUserById(
    id: string,
    session?: ClientSession,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findById(id).session(session || null);
      return user;
    } catch (error) {
      throw new Error('Failed to find user by ID: ' + error.message);
    }
  }

  async updateUserById(
    id: string,
    updateUserDto: UpdateUserDto,
    session?: ClientSession,
  ): Promise<UserDocument | null> {
    try {
      const options = session ? { session, new: true } : { new: true };
      const user = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        options,
      );
      return user;
    } catch (error) {
      throw new Error('Failed to update user by ID: ' + error.message);
    }
  }

  async removeUserById(
    id: string,
    session?: ClientSession,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { session },
      );
      return user;
    } catch (error) {
      throw new Error('Failed to delete user by ID: ' + error.message);
    }
  }

  async getUserBySlug(
    slug: string,
    session?: ClientSession,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findOne(
        { slug, isDeleted: false },
        null,
        session ? { session } : {},
      );
      return user;
    } catch (error) {
      throw new Error('Failed to get user by slug: ' + error.message);
    }
  }

  async getUserByEmail(
    email: string,
    session?: ClientSession,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findOne(
        { email, isDeleted: false },
        null,
        session ? { session } : {},
      );
      return user;
    } catch (error) {
      throw new Error('Failed to get user by email: ' + error.message);
    }
  }

  async getUserByUsername(
    username: string,
    session?: ClientSession,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findOne(
        { username, isDeleted: false },
        null,
        session ? { session } : {},
      );
      return user;
    } catch (error) {
      throw new Error('Failed to get user by username: ' + error.message);
    }
  }
}
