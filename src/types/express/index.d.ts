import { UserDocument } from '../../app/modules/users/schema/user.schema';

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument | any; // hoặc định nghĩa type bạn trả về từ JwtStrategy
        }
    }
}
