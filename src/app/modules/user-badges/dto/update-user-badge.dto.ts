import { PartialType } from '@nestjs/mapped-types';
import { CreateUserBadgeDto } from './create-user-badge.dto';

export class UpdateUserBadgeDto extends PartialType(CreateUserBadgeDto) {}
