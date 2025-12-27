import { Body, Controller, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UnitProgressService } from './unit-progress.service';
import { UnitProgressDocument } from './schema/unit-progress.schema';
import { CreateUnitProgressDto } from './dto/create-unit-progress.dto';

@Controller('unit-progress')
@ApiTags('Unit Progress')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class UnitProgressController {
  constructor(private readonly unitProgressService: UnitProgressService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new unit progress' })
  @ApiBody({
    type: CreateUnitProgressDto,
    description: 'Create unit progress data',
    examples: {
      example: {
        value: {
          userId: '123',
          unitId: '123',
          orderIndex: 1,
          progress: 50,
          status: 'completed',
          completedAt: '2021-01-01',
          createBy: '123',
          updatedBy: '123',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Unit progress created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUnitProgress(
    @Body() createUnitProgressDto: CreateUnitProgressDto,
  ): Promise<UnitProgressDocument> {
    return await this.unitProgressService.createUnitProgress(createUnitProgressDto);
  }
}