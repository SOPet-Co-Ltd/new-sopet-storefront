import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';

export type VendorReply = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type VendorReplyBlockProps = {
  reply: VendorReply;
};

export function VendorReplyBlock({ reply }: VendorReplyBlockProps) {
  const displayDate = reply.updatedAt || reply.createdAt;

  return (
    <div
      role="region"
      aria-label="คำตอบจากผู้ขาย"
      className="mt-3 rounded-sop-8 border-l-4 border-sop-primary-400 bg-sop-primary-100 p-3"
      data-testid="vendor-reply-block"
    >
      <p className="sop-body-xs-medium text-sop-primary-700">คำตอบจากผู้ขาย</p>
      <time className="sop-body-xs-regular text-sop-neutral-gray-400" dateTime={displayDate}>
        {formatThaiDate(displayDate)}
      </time>
      <p className="mt-2 sop-body-sm-regular whitespace-pre-wrap text-sop-neutral-gray-300">
        {reply.body}
      </p>
    </div>
  );
}
