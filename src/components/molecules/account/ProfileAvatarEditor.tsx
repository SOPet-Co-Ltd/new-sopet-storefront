'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { EditIcon } from '@/components/atoms/icons';
import { SpinnerIcon } from '@/components/atoms/icons/outline';
import { uploadProfileImage, validateProfileImageFile } from '@/lib/upload/uploadProfileImage';
import { cn } from '@/lib/utils';

type ProfileAvatarEditorProps = {
  value?: string | null;
  initials: string;
  displayName: string;
  disabled?: boolean;
  onChange: (url: string | null) => Promise<void>;
};

export function ProfileAvatarEditor({
  value,
  initials,
  displayName,
  disabled = false,
  onChange,
}: ProfileAvatarEditorProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState(value ?? null);

  // Reset the local preview when the external value changes (e.g. profile refetch),
  // following the "adjusting state when a prop changes" pattern instead of an effect.
  if ((value ?? null) !== prevValue) {
    setPrevValue(value ?? null);
    setPreviewUrl(value ?? null);
  }

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    const validationError = validateProfileImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const url = await uploadProfileImage(file);
      await onChange(url);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewUrl(value ?? null);
      setError(err instanceof Error ? err.message : 'อัปโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);
    try {
      await onChange(null);
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถลบรูปภาพได้');
    } finally {
      setUploading(false);
    }
  }

  const displayUrl = previewUrl;
  const isBusy = disabled || uploading;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-sop-base-white bg-sop-primary-100 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-transform',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sop-primary-500 focus-visible:ring-offset-2',
            !isBusy && 'hover:scale-[1.02]',
            isBusy && 'cursor-not-allowed opacity-80',
          )}
          aria-label={displayUrl ? 'เปลี่ยนรูปโปรไฟล์' : 'อัปโหลดรูปโปรไฟล์'}
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden className="sop-headline-md-medium text-sop-primary-600">
              {initials}
            </span>
          )}

          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-sop-neutral-gray-200/40 opacity-0 transition-opacity',
              !isBusy && 'group-hover:opacity-100 group-focus-visible:opacity-100',
              uploading && 'opacity-100',
            )}
            aria-hidden
          >
            {uploading ? (
              <SpinnerIcon size={{ mobile: 24, desktop: 24 }} color="#FFFFFF" />
            ) : (
              <EditIcon size={{ mobile: 24, desktop: 24 }} color="#FFFFFF" />
            )}
          </span>
        </button>

        <span
          className="pointer-events-none absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-sop-base-white bg-sop-primary-500 text-sop-base-white shadow-sm"
          aria-hidden
        >
          <EditIcon size={{ mobile: 16, desktop: 16 }} color="currentColor" />
        </span>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={isBusy}
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      <p className="mt-4 sop-body-xs-regular text-sop-neutral-gray-400">
        รองรับ JPEG, PNG, WebP หรือ GIF ขนาดไม่เกิน 5 MB
      </p>

      {displayUrl ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void handleRemove()}
          className="mt-2 sop-body-xs-medium text-sop-secondary-500 underline-offset-2 hover:underline disabled:opacity-50"
        >
          ลบรูปโปรไฟล์
        </button>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-2 max-w-xs text-center sop-body-sm-regular text-sop-system-error-400"
        >
          {error}
        </p>
      ) : null}

      <span className="sr-only">{displayName}</span>
    </div>
  );
}
