import { Controller, Query, Param, Patch, Post, Body, Delete, Get } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchaseStatus } from './schema/purchase.schema';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiBody({ type: CreatePurchaseDto, description: 'The purchase to create', examples: { example1: { value: { userId: '1234567890', packageId: '1234567890', transactionId: '1234567890', amount: 100, currency: 'VND', status: PurchaseStatus.PENDING } } } })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createPurchase(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.createPurchase(createPurchaseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase by id' })
  @ApiParam({ name: 'id', description: 'The id of the purchase' })
  @ApiResponse({ status: 200, description: 'Purchase found successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findPurchaseById(@Param('id') id: string) {
    return this.purchasesService.findPurchaseById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases' })
  @ApiQuery({ name: 'page', description: 'The page number', required: false })
  @ApiQuery({ name: 'limit', description: 'The number of purchases per page', required: false })
  @ApiResponse({ status: 200, description: 'Purchases found successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAllPurchases(@Query('page') page: number, @Query('limit') limit: number) {
    return this.purchasesService.findAllPurchases(page, limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all purchases by user id' })
  @ApiParam({ name: 'userId', description: 'The id of the user' })
  @ApiQuery({ name: 'page', description: 'The page number', required: false })
  @ApiQuery({ name: 'limit', description: 'The number of purchases per page', required: false })
  @ApiResponse({ status: 200, description: 'Purchases found successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllPurchasesByUserId(@Param('userId') userId: string, @Query('page') page: number, @Query('limit') limit: number) {
    return this.purchasesService.findPurchasesByUserId(userId, page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase by id' })
  @ApiParam({ name: 'id', description: 'The id of the purchase' })
  @ApiBody({ type: UpdatePurchaseDto, description: 'The purchase to update', examples: { example1: { value: { status: PurchaseStatus.SUCCESS } } } })
  @ApiResponse({ status: 200, description: 'Purchase updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async updatePurchaseById(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return this.purchasesService.updatePurchase(id, updatePurchaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase by id' })
  @ApiParam({ name: 'id', description: 'The id of the purchase' })
  @ApiResponse({ status: 200, description: 'Purchase deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async deletePurchaseById(@Param('id') id: string) {
    return this.purchasesService.deletePurchase(id);
  }

  @Post('verify/:id')
  @ApiOperation({ summary: 'Verify a purchase by id' })
  @ApiParam({ name: 'id', description: 'The id of the purchase' })
  @ApiResponse({ status: 200, description: 'Purchase verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async verifyPurchaseById(@Param('id') id: string) {
    return this.purchasesService.verifyPurchase(id);
  }
}