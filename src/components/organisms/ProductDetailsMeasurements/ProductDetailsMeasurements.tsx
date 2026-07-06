'use client';

type ProductDetailsMeasurementsProps = {
  measurements?: Array<{ label: string; value: string }>;
};

export default function ProductDetailsMeasurements({
  measurements = [],
}: ProductDetailsMeasurementsProps) {
  if (measurements.length === 0) return null;

  return (
    <details className="border border-sop-neutral-grayalpha-200 rounded-sop-8px p-4">
      <summary className="sop-body-md-medium text-sop-neutral-gray-300 cursor-pointer">
        ขนาดและน้ำหนัก
      </summary>
      <div className="mt-4 flex flex-col gap-2">
        {measurements.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-2 border border-sop-neutral-grayalpha-200 rounded-sop-8px text-center sop-body-sm-regular"
          >
            <div className="border-r py-3">{item.label}</div>
            <div className="py-3">{item.value}</div>
          </div>
        ))}
      </div>
    </details>
  );
}
