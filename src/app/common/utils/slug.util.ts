import slugify from 'slugify';

export function generateSlug(name: string): string {
    if (!name) return '';
    return slugify(name, {
        lower: true, // chữ thường
        strict: true, // bỏ ký tự đặc biệt
        locale: 'vi', // hỗ trợ tiếng Việt
        trim: true, // bỏ khoảng trắng
    });
}