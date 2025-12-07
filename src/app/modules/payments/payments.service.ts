import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './schema/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { getClientIp } from 'request-ip';
import { Request } from 'express';
import { envSchema } from 'src/app/configs/env/env.config';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { Subscription, SubscriptionDocument, SubscriptionStatus } from '../subscriptions/schema/subscription.schema';
import { Purchase, PurchaseDocument, PurchaseStatus } from '../purchases/schema/purchase.schema';
import { User, UserDocument } from '../users/schema/user.schema';
import { Package, PackageDocument } from '../packages/schema/package.schema';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
  ) { }


  private sortParams(params: Record<string, any>) {
    return Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  }

  private signData(secret: string, params: any): string {
    const signData = qs.stringify(params, { encode: false });
    return crypto.createHmac('sha512', secret).update(Buffer.from(signData)).digest('hex');
  }

  private formatDate(date: Date) {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return date.getFullYear().toString()
      + pad(date.getMonth() + 1)
      + pad(date.getDate())
      + pad(date.getHours())
      + pad(date.getMinutes())
      + pad(date.getSeconds());
  }


  async createPayment(dto: CreatePaymentDto, req: Request) {
    const env = envSchema.parse(process.env);
    const clientIp = getClientIp(req);
    const now = new Date();
    const orderId = now.getTime().toString();

    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: env.VNPAY_TMN_CODE,
      vnp_Amount: dto.amount * 100,
      vnp_CurrCode: dto.currency,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: dto.description ?? `Thanh toán đơn hàng ${orderId}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: env.VNPAY_RETURN_URL,
      vnp_IpAddr: clientIp,
      vnp_CreateDate: this.formatDate(now),
      vnp_Locale: 'vn',
    };

    this.logger.log(`[DEBUG] Params: ${JSON.stringify(params)}`);

    const sorted = this.sortParams(params);
    const secureHash = this.signData(env.VNPAY_HASH_SECRET ?? '', sorted);

    this.logger.log(`[DEBUG] Secure hash: ${secureHash}`);

    const paymentUrl = `${env.VNPAY_API_URL}?${qs.stringify({
      ...sorted,
      vnp_SecureHash: secureHash,
    })}`;

    await this.paymentModel.create({
      userId: dto.userId,
      amount: dto.amount,
      currency: dto.currency,
      method: dto.method,
      description: dto.description,
      transactionId: orderId,
      status: PaymentStatus.PENDING,
    });

    this.logger.log(`[DEBUG] Payment created successfully for transaction ID: ${orderId}`);

    return { paymentUrl };
  }


  private verifyChecksum(query: any, env: any) {
    const secureHash = query.vnp_SecureHash;

    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sorted = this.sortParams(query);
    const signed = this.signData(env.VNPAY_HASH_SECRET, sorted);

    return secureHash === signed;
  }


  private async activateServices(transactionId: string) {
    // Find purchase
    const purchase = await this.purchaseModel.findOne({ paymentId: transactionId });
    if (!purchase) throw new NotFoundException('Purchase not found');

    // Update purchase status
    purchase.status = PurchaseStatus.SUCCESS;
    await purchase.save();

    this.logger.log(`[DEBUG] Purchase updated status to SUCCESS for transaction ID: ${transactionId}`);

    // Find user
    const user = await this.userModel.findById(purchase.userId);
    if (!user) throw new NotFoundException('User not found');

    const packagedId = purchase.packageId.toString();
    if (!packagedId) throw new NotFoundException('Package not found');

    const packageResult = await this.packageModel.findById(packagedId);
    if (!packageResult) throw new NotFoundException('Package not found');

    // Set user package
    user.accountPackage = packageResult.type;

    await user.save();

    this.logger.log(`[DEBUG] User updated package to ${packageResult.type} for transaction ID: ${transactionId}`);

    // Subscription (optional)
    const subscription = await this.subscriptionModel.findOne({ paymentId: transactionId });
    if (subscription) {
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.startDate = new Date();
      subscription.endDate = new Date(new Date().setDate(new Date().getDate() + packageResult.durationInDays));
      await subscription.save();
    }

    return { purchase, user, subscription };
  }


  async handleReturn(query: any) {
    const env = envSchema.parse(process.env);

    if (!this.verifyChecksum(query, env)) {
      return { success: false, message: 'Invalid checksum' };
    }

    const success = query.vnp_ResponseCode === '00';

    if (success) {
      await this.activateServices(query.vnp_TxnRef);
      this.logger.log(`[DEBUG] Purchase activated successfully for transaction ID: ${query.vnp_TxnRef}`);
    }

    const payment = await this.paymentModel.findOneAndUpdate(
      { transactionId: query.vnp_TxnRef },
      { status: success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED, paidAt: new Date() },
      { new: true },
    );

    return { success, data: payment };
  }

  async handleWebhook(query: any) {
    const env = envSchema.parse(process.env);

    if (!this.verifyChecksum(query, env)) {
      return { RspCode: '97', Message: 'Invalid checksum' };
    }

    const success = query.vnp_ResponseCode === '00';

    if (success) {
      await this.activateServices(query.vnp_TxnRef);
      this.logger.log(`[DEBUG] Purchase activated successfully for transaction ID: ${query.vnp_TxnRef}`);
    }

    await this.paymentModel.findOneAndUpdate(
      { transactionId: query.vnp_TxnRef },
      { status: success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED, paidAt: new Date() },
    );

    return { RspCode: '00', Message: 'Confirm Success' };
  }
}
