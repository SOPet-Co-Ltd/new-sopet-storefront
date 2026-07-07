import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

const productMarkdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="sop-headline-sm-medium text-sop-primary-700 mb-4 mt-8">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="sop-headline-xs-medium text-sop-primary-700 mb-4 mt-6">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 last:mb-0 sop-body-md-regular text-sop-neutral-gray-300">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-4 list-outside mb-4 last:mb-0 sop-body-md-regular text-sop-neutral-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 list-outside mb-4 last:mb-0 sop-body-md-regular text-sop-neutral-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-2 sop-body-md-regular text-sop-neutral-gray-300">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="sop-body-md-medium text-sop-neutral-gray-300">{children}</strong>
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
};

function hasHtmlMarkup(source: string): boolean {
  return /<[^>]+>/.test(source);
}

type ProductDescriptionContentProps = {
  description: string;
};

export function ProductDescriptionContent({ description }: ProductDescriptionContentProps) {
  return (
    <div data-testid="product-markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={hasHtmlMarkup(description) ? [rehypeRaw, rehypeSanitize] : [rehypeSanitize]}
        components={productMarkdownComponents}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
}
