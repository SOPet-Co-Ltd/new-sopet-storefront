type JsonLdData = Record<string, unknown> | Array<Record<string, unknown>>;

type JsonLdScriptProps = {
  data: JsonLdData | null | undefined;
};

function isEmptyJsonLdPayload(data: JsonLdData): boolean {
  if (Array.isArray(data)) {
    return data.length === 0;
  }

  return Object.keys(data).length === 0;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  if (data == null || isEmptyJsonLdPayload(data)) {
    return null;
  }

  const json = JSON.stringify(data);

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
