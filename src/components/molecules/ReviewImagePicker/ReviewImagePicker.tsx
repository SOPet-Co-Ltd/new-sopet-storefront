'use client';

import { useEffect, useMemo, useState } from 'react';
import { REVIEW_MAX_IMAGES, validateReviewImageFile } from '@/lib/upload/uploadReviewImage';

type ReviewImagePickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export function ReviewImagePicker({ files, onChange, disabled = false }: ReviewImagePickerProps) {
  const [error, setError] = useState<string | null>(null);
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrls]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (selected.length === 0) {
      return;
    }

    const combined = [...files, ...selected];
    if (combined.length > REVIEW_MAX_IMAGES) {
      setError(`อัปโหลดได้สูงสุด ${REVIEW_MAX_IMAGES} รูป`);
      return;
    }

    for (const file of selected) {
      const validationError = validateReviewImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    onChange(combined);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
    setError(null);
  }

  return (
    <div className="space-y-2" data-testid="review-image-picker">
      <div className="flex flex-wrap items-center gap-2">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative">
            <img
              src={url}
              alt=""
              className="h-16 w-16 rounded-sop-8px border border-sop-neutral-grayalpha-200 object-cover"
            />
            <button
              type="button"
              aria-label="ลบรูป"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sop-neutral-gray-300 text-xs text-sop-base-white"
              disabled={disabled}
              onClick={() => removeFile(index)}
            >
              ×
            </button>
          </div>
        ))}
        {files.length < REVIEW_MAX_IMAGES ? (
          <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-sop-8px border border-dashed border-sop-neutral-grayalpha-300 sop-body-xs-regular text-sop-neutral-gray-400">
            + รูป
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={disabled}
              onChange={handleFileChange}
            />
          </label>
        ) : null}
      </div>
      <p className="sop-body-xs-regular text-sop-neutral-gray-400">
        {files.length}/{REVIEW_MAX_IMAGES} รูป (JPEG, PNG, WebP, GIF สูงสุด 5 MB)
      </p>
      {error ? (
        <p className="sop-body-xs-regular text-sop-system-error-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
