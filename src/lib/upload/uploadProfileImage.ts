import { UploadImageDocument } from '@/lib/graphql/generated/graphql';
import { getApolloClient } from '@/lib/graphql/client';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('อัปโหลดรูปภาพไม่สำเร็จ'));
      }
    };
    reader.onerror = () => reject(new Error('อัปโหลดรูปภาพไม่สำเร็จ'));
    reader.readAsDataURL(file);
  });
}

export function validateProfileImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ GIF';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'ขนาดไฟล์ต้องไม่เกิน 5 MB';
  }
  return null;
}

export async function uploadProfileImage(file: File): Promise<string> {
  const validationError = validateProfileImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const base64 = await readFileAsDataUrl(file);
  const { data } = await getApolloClient().mutate({
    mutation: UploadImageDocument,
    variables: { base64, folder: 'profiles' },
  });

  if (!data?.uploadImage?.url) {
    throw new Error('อัปโหลดรูปภาพไม่สำเร็จ');
  }

  return data.uploadImage.url;
}
