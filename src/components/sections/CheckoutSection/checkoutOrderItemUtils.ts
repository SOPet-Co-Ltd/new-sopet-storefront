export function formatCheckoutPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCheckoutVariantLabel(optionsJson: string | null | undefined): string | null {
  if (!optionsJson) return null;

  try {
    const parsed = JSON.parse(optionsJson) as Record<string, string>;
    const values = Object.values(parsed).filter(Boolean);

    if (values.length === 0) return null;

    return `ตัวเลือกสินค้า : ${values.join(', ')}`;
  } catch {
    return null;
  }
}
