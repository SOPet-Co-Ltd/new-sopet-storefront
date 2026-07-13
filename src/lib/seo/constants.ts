export const STORE_STATUS_APPROVED = 'approved';
export const PRODUCT_STATUS_PUBLISHED = 'published';

export const DEFAULT_BASE_URL = 'http://localhost:3000';
export const DEFAULT_SITE_NAME = 'Sopet';
export const DEFAULT_DESCRIPTION_MAX_LENGTH = 160;

export const DEFAULT_SITE_DESCRIPTION =
  'Sopet คือแพลตฟอร์มค้นหายาและสินค้าสำหรับสัตว์เลี้ยงจากโรงพยาบาลและร้านขายยาทั่วไทย เปรียบเทียบราคา รับโค้ดส่วนลด และจัดส่งรวดเร็ว';

/** Default OG image path — TBD-03 placeholder until final creative (task 20). */
export const DEFAULT_OG_IMAGE_PATH = '/og/default-og.jpg';

export const POLICY_PATHS = [
  {
    pathSegment: 'privacy-policy',
    title: 'นโยบายความเป็นส่วนตัว',
    description:
      'วิธีที่ Sopet เก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ รวมถึงสิทธิ์และช่องทางติดต่อ',
  },
  {
    pathSegment: 'terms-of-service',
    title: 'นโยบายการใช้งาน',
    description:
      'เงื่อนไขการให้บริการ ข้อกำหนดผู้ขายสินค้าสัตว์เลี้ยง และการใช้งานแพลตฟอร์ม Sopet ตามกฎหมายไทย',
  },
  {
    pathSegment: 'refund-policy',
    title: 'นโยบายการคืนเงิน',
    description:
      'เงื่อนไขการคืนเงินและคืนสินค้าสำหรับการสั่งซื้อผ่านแพลตฟอร์ม Sopet รวมถึงกรณีสินค้าชำรุด หมดอายุ และการคืนโดยไม่มีเหตุผล',
  },
] as const;
