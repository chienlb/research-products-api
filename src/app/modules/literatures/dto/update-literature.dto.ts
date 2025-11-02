import { PartialType } from '@nestjs/mapped-types';
import { CreateLiteratureDto } from './create-literature.dto';

export class UpdateLiteratureDto extends PartialType(CreateLiteratureDto) {}
