'use client';

type ProductAdditionalAttributesProps = {
  tags?: string[];
  warning?: string | null;
};

export default function ProductAdditionalAttributes({
  tags = [],
  warning,
}: ProductAdditionalAttributesProps) {
  if (tags.length === 0 && !warning) return null;

  return (
    <details className="border border-sop-neutral-grayalpha-200 rounded-sop-8px p-4" open>
      <summary className="sop-body-md-medium text-sop-neutral-gray-300 cursor-pointer">
        ข้อมูลเพิ่มเติม
      </summary>
      <div className="mt-4 flex flex-col gap-3">
        {warning && (
          <p className="sop-body-sm-regular text-sop-system-warning-500">{warning}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sop-neutral-gray-500 px-3 py-1 sop-body-xs-regular text-sop-neutral-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
