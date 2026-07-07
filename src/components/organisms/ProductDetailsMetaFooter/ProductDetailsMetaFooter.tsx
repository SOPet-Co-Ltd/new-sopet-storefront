type ProductDetailsMetaFooterProps = {
  tags: string[];
};

export default function ProductDetailsMetaFooter({ tags }: ProductDetailsMetaFooterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="p-4 border rounded-xs" data-testid="product-meta-footer">
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-sop-neutral-grayalpha-200 px-3 py-1 sop-body-xs-regular text-sop-neutral-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
