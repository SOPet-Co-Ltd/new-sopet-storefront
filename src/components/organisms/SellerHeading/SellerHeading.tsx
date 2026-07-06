import Image from 'next/image';
import { ProfileFilledIcon } from '@/components/atoms/icons/filled/ProfileFilledIcon';
import type { StoreDetail } from '@/lib/hooks/useStore';

type SellerHeadingProps = {
  store: StoreDetail;
};

function StoreAvatar({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={50}
        height={50}
        className="rounded-full object-cover w-[50px] h-[50px]"
      />
    );
  }

  return <ProfileFilledIcon color="#211F23" size={{ mobile: 50, desktop: 50 }} />;
}

export function SellerHeading({ store }: SellerHeadingProps) {
  return (
    <div className="border rounded-xs p-4" data-testid="seller-heading">
      <div className="flex items-center gap-4">
        <div className="border rounded-full overflow-clip shrink-0">
          <StoreAvatar logoUrl={store.logoUrl} name={store.name} />
        </div>
        <h1 className="sop-headline-sm-regular text-sop-neutral-gray-300">{store.name}</h1>
      </div>
      {store.description ? (
        <p className="sop-body-md-regular text-sop-neutral-gray-300 my-5 whitespace-pre-line">
          {store.description}
        </p>
      ) : null}
    </div>
  );
}
