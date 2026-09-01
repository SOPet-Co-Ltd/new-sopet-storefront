import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

type PolicyMarkdownLayoutProps = {
  title: string;
  source: string;
};

const policyMarkdownComponents: Components = {
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
    <ul className="mb-4 list-outside list-disc pl-4 last:mb-0 sop-body-md-regular text-sop-neutral-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-outside list-decimal pl-4 last:mb-0 sop-body-md-regular text-sop-neutral-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-2 sop-body-md-regular text-sop-neutral-gray-300">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="sop-body-md-medium text-sop-neutral-gray-200">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-sop-neutral-gray-300">{children}</em>,
  a: ({ children, href }) => {
    const isExternal = Boolean(href?.startsWith('http://') || href?.startsWith('https://'));
    return (
      <a
        href={href}
        className="text-sop-secondary-500 underline underline-offset-2"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },
};

function PolicyMarkdownContent({ source }: { source: string }) {
  return (
    <div data-testid="policy-markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={policyMarkdownComponents}
      >
        {source.trim()}
      </ReactMarkdown>
    </div>
  );
}

export function PolicyMarkdownLayout({ title, source }: PolicyMarkdownLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <h1 className="sop-headline-md-medium text-sop-primary-700 mb-8">{title}</h1>
      <PolicyMarkdownContent source={source} />
    </main>
  );
}
