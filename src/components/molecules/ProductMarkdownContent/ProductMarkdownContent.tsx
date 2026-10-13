import { Children, isValidElement, type ReactNode } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

const productDescriptionSanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'img', 'blockquote', 'hr', 'pre', 'code'],
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      'src',
      'alt',
      'title',
      'width',
      'height',
      'loading',
      'className',
      'class',
    ],
    code: [...(defaultSchema.attributes?.code ?? []), 'className', 'class'],
    pre: [...(defaultSchema.attributes?.pre ?? []), 'className', 'class'],
  },
  protocols: {
    ...defaultSchema.protocols,
    // Local MinIO uses http://; production CDN uses https://
    src: ['http', 'https'],
    href: ['http', 'https', 'mailto'],
  },
};

function isAllowedImageSrc(src: string): boolean {
  return src.startsWith('https://') || src.startsWith('http://');
}

function isImageOnlyParagraph(children: ReactNode): boolean {
  const meaningful = Children.toArray(children).filter((child) => {
    if (typeof child === 'string') return child.trim().length > 0;
    return true;
  });

  if (meaningful.length !== 1) return false;

  const only = meaningful[0];
  return isValidElement(only) && typeof (only.props as { src?: unknown }).src === 'string';
}

const productMarkdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-xl font-semibold leading-snug text-sop-neutral-gray-100 first:mt-0 md:col-span-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-lg font-semibold leading-snug text-sop-neutral-gray-100 first:mt-0 md:col-span-2">
      {children}
    </h3>
  ),
  p: ({ children }) => {
    if (isImageOnlyParagraph(children)) {
      return <p className="m-0 min-w-0">{children}</p>;
    }

    return (
      <p className="mb-2 last:mb-0 text-sm leading-relaxed text-sop-neutral-gray-100 md:col-span-2">
        {children}
      </p>
    );
  },
  ul: ({ children }) => (
    <ul className="mb-2 list-outside list-disc pl-5 last:mb-0 text-sm leading-relaxed text-sop-neutral-gray-100 md:col-span-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-outside list-decimal pl-5 last:mb-0 text-sm leading-relaxed text-sop-neutral-gray-100 md:col-span-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-1 text-sm leading-relaxed text-sop-neutral-gray-100">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-sop-neutral-gray-100">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-sop-primary-700 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => {
    if (!src || typeof src !== 'string' || !isAllowedImageSrc(src)) {
      return null;
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element -- product description markdown URLs are dynamic CDN paths
      <img src={src} alt={alt ?? ''} loading="lazy" className="h-auto w-full rounded-lg" />
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-4 border-sop-neutral-grayalpha-200 pl-4 text-sm italic leading-relaxed text-sop-neutral-gray-200 md:col-span-2">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-sop-neutral-grayalpha-200 md:col-span-2" />,
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-sop-neutral-gray-500 p-3 text-sm leading-relaxed text-sop-neutral-gray-100 md:col-span-2">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded bg-sop-neutral-gray-500 px-1.5 py-0.5 text-sm text-sop-neutral-gray-100">
        {children}
      </code>
    );
  },
};

function hasHtmlMarkup(source: string): boolean {
  return /<[^>]+>/.test(source);
}

type ProductDescriptionContentProps = {
  description: string;
};

export function ProductDescriptionContent({ description }: ProductDescriptionContentProps) {
  return (
    <div
      data-testid="product-markdown-content"
      className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={
          hasHtmlMarkup(description)
            ? [rehypeRaw, [rehypeSanitize, productDescriptionSanitizeSchema] as const]
            : [[rehypeSanitize, productDescriptionSanitizeSchema] as const]
        }
        components={productMarkdownComponents}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
}
