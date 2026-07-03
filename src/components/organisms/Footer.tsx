import { cn } from "@/lib/utils";
import Link from "next/link";
import { FacebookIcon, FooterMailIcon, LineIcon, QrAddLineOAIcon } from "../atoms/icons";

const COMPANY_INFO = {
  name: "บริษัท เอสโอเพ็ท จำกัด",
  address: "เลขที่ 17 ซอยสุขุมวิท 35 แขวงคลองตันเหนือ",
  district: "เขตวัฒนา กรุงเทพมหานคร 10110",
  email: "sopetofficial@gmail.com",
  copyright: "Copyright © 2025 SOpet All right reserved",
};

const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/sopetofficial", Icon: FacebookIcon },
  { name: "Line", href: "https://line.me/R/ti/p/@131skdjz", Icon: LineIcon },
];

const LINE_OA_TITLE = ["ปรึกษาสัตว​์แพทย์ฟรี !", "ผ่าน LINE OA"];

const FOOTER_LINKS = [
  { label: "นโยบายการใช้งาน", href: "/policy/terms-of-service" },
  { label: "นโยบายการคืนเงิน", href: "/policy/refund-policy" },
  { label: "นโยบายความเป็นส่วนตัว", href: "/policy/privacy-policy" },
];

export function Footer() {
  return (
    <footer className="bg-sop-base-white w-full" aria-label="Site footer">
      <div
        className={cn(
          "bg-sop-base-white bg-pattern-dog-paw relative w-full",
          "px-sop-16px py-sop-48px md:px-sop-32px md:py-sop-40px lg:px-sop-80px lg:py-sop-48px"
        )}
      >
        <div className="grid gap-sop-20px sm:grid-cols-1 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-sop-20px">
            <p className="sop-body-lg-regular text-sop-base-black">
              {COMPANY_INFO.name}
              <br />
              {COMPANY_INFO.address}
              <br />
              {COMPANY_INFO.district}
            </p>
            <Link href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-2">
              <FooterMailIcon size={{ desktop: 21, mobile: 21 }} />
              <p className="sop-body-md-medium text-sop-base-black">{COMPANY_INFO.email}</p>
            </Link>
            <div className="flex items-center gap-sop-16px">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <Link key={name} href={href} target="_blank" rel="noopener noreferrer">
                  <Icon size={{ mobile: 24, desktop: 24 }} />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-sop-24px flex flex-col">
              {LINE_OA_TITLE.map((line) => (
                <h4 key={line} className="sop-body-lg-medium text-sop-base-black">
                  {line}
                </h4>
              ))}
            </div>
            <div className="flex w-fit items-center justify-center rounded-[14px] border border-sop-system-success-400 px-sop-20px py-sop-24px">
              <QrAddLineOAIcon size={{ desktop: 128, mobile: 128 }} color="#05D35E" />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex w-full items-center",
          "px-sop-16px py-sop-16px md:px-sop-32px lg:px-sop-80px",
          "flex-col gap-sop-12px md:flex-row md:justify-between"
        )}
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--color-sop-primary-500) 0%, var(--color-sop-secondary-500) 100%)",
        }}
      >
        <p className="sop-body-xs-regular text-sop-base-white text-center md:text-left">
          {COMPANY_INFO.copyright}
        </p>
        <div className="flex items-center gap-sop-12px">
          {FOOTER_LINKS.map(({ label, href }, index) => (
            <div key={label} className="flex items-center gap-sop-12px">
              <Link
                href={href}
                className="sop-body-xs-regular text-sop-base-white transition-opacity hover:opacity-80"
              >
                {label}
              </Link>
              {index < FOOTER_LINKS.length - 1 && (
                <div className="h-4 w-px bg-sop-neutral-whitealpha-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
