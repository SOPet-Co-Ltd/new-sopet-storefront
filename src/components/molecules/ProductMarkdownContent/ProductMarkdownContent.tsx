type ProductMarkdownContentProps = {
  source: string;
};

function ProductMarkdownContent({ source }: ProductMarkdownContentProps) {
  const lines = source.trim().split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    nodes.push(
      <ul
        key={key++}
        className="list-disc pl-4 list-outside mb-4 last:mb-0 sop-body-md-regular text-sop-neutral-gray-300"
      >
        {listItems.map((item, index) => (
          <li key={index} className="mb-2 sop-body-md-regular text-sop-neutral-gray-300">
            {item}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      nodes.push(
        <h2 key={key++} className="sop-headline-sm-medium text-sop-primary-700 mb-4 mt-8">
          {trimmed.slice(3)}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      nodes.push(
        <h3 key={key++} className="sop-headline-xs-medium text-sop-primary-700 mb-4 mt-6">
          {trimmed.slice(4)}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith('-')) {
      listItems.push(trimmed.replace(/^-\s?/, ''));
      continue;
    }

    flushList();
    nodes.push(
      <p key={key++} className="mb-4 last:mb-0 sop-body-md-regular text-sop-neutral-gray-300">
        {trimmed}
      </p>,
    );
  }

  flushList();

  return <>{nodes}</>;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
}

type ProductDescriptionContentProps = {
  description: string;
};

export function ProductDescriptionContent({ description }: ProductDescriptionContentProps) {
  const hasHtml = /<[^>]+>/.test(description);

  if (hasHtml) {
    return (
      <div
        className="prose prose-sm max-w-none sop-body-md-regular text-sop-neutral-gray-300 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
      />
    );
  }

  return <ProductMarkdownContent source={description} />;
}
