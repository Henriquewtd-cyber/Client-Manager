

import { cloudinary } from '@/lib/cloudnary';

type UploadResult = {
    url: string;
    public_id: string;
};

export function uploadComprovante(buffer: Buffer): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'comprovantes',
                resource_type: 'auto',
            },
            (error, result) => {
                if (error || !result) return reject(error);

                resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        ).end(buffer);
    });
}

export async function deleteComprovante(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
}