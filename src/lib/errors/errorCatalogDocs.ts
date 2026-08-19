import { ERROR_CODES, type ErrorCode } from './errorCodes';

/** Optional documentation fields for the public error catalog. */
export type ErrorCatalogDocs = {
  why?: string;
  possibleIssue?: string;
  howToFix?: string;
};

/**
 * Rich docs for high-traffic / well-understood shopper-facing codes.
 * Codes without an entry stay message-only on the catalog page.
 */
export const ERROR_CATALOG_DOCS: Partial<Record<ErrorCode, ErrorCatalogDocs>> = {
  // —— Auth ——
  [ERROR_CODES.ACCOUNT_SUSPENDED]: {
    why: 'บัญชีถูกระงับโดยระบบหรือฝ่ายสนับสนุน',
    possibleIssue: 'มีการละเมิดข้อกำหนดการใช้งาน หรือบัญชีถูกระงับชั่วคราว',
    howToFix: 'ติดต่อฝ่ายสนับสนุนเพื่อสอบถามสาเหตุและขอเปิดใช้งานบัญชี',
  },
  [ERROR_CODES.CUSTOMER_NOT_FOUND]: {
    why: 'ไม่พบบัญชีลูกค้าที่ตรงกับข้อมูลที่ระบุ',
    possibleIssue: 'เบอร์โทร/อีเมลยังไม่ได้สมัคร หรือบัญชีถูกลบแล้ว',
    howToFix: 'ตรวจสอบข้อมูลให้ถูกต้อง หรือสมัครสมาชิกใหม่',
  },
  [ERROR_CODES.CUSTOMER_PENDING_DELETION]: {
    why: 'บัญชีอยู่ระหว่างขั้นตอนขอลบ',
    possibleIssue: 'มีการขอลบบัญชีไว้ก่อนหน้านี้และยังไม่หมดระยะเก็บข้อมูล',
    howToFix: 'เปิดใช้งานบัญชีอีกครั้งก่อนใช้งาน หรือรอจนกว่ากระบวนการลบจะเสร็จ',
  },
  [ERROR_CODES.CUSTOMER_REQUIRED]: {
    why: 'ฟีเจอร์นี้ต้องเข้าสู่ระบบก่อน',
    possibleIssue: 'ยังไม่ได้ล็อกอิน หรือเซสชันหมดอายุ',
    howToFix: 'เข้าสู่ระบบด้วยเบอร์โทรศัพท์แล้วลองอีกครั้ง',
  },
  [ERROR_CODES.CUSTOMER_SUSPENDED]: {
    why: 'บัญชีลูกค้าถูกระงับ',
    possibleIssue: 'บัญชีถูกระงับชั่วคราวหรือถาวร',
    howToFix: 'ติดต่อฝ่ายสนับสนุนเพื่อขอความช่วยเหลือ',
  },
  [ERROR_CODES.DELETION_ALREADY_REQUESTED]: {
    why: 'มีการขอลบบัญชีอยู่แล้ว',
    possibleIssue: 'ส่งคำขอลบซ้ำ',
    howToFix: 'รอขั้นตอนที่มีอยู่ หรือเปิดใช้งานบัญชีหากยังเปลี่ยนใจ',
  },
  [ERROR_CODES.GUEST_PHONE_REQUIRED]: {
    why: 'การสั่งซื้อแบบแขกต้องมีเบอร์โทรติดต่อ',
    possibleIssue: 'ยังไม่ได้กรอกเบอร์ หรือรูปแบบเบอร์ไม่ถูกต้อง',
    howToFix: 'กรอกเบอร์โทรศัพท์ไทยที่ใช้งานได้จริง',
  },
  [ERROR_CODES.INVALID_CREDENTIALS]: {
    why: 'ข้อมูลเข้าสู่ระบบไม่ตรงกับบัญชี',
    possibleIssue: 'เบอร์โทรหรือรหัสผ่านผิด',
    howToFix: 'ตรวจสอบเบอร์โทรและรหัสผ่าน แล้วลองใหม่',
  },
  [ERROR_CODES.INVALID_OTP]: {
    why: 'รหัส OTP ที่กรอกไม่ถูกต้องหรือหมดอายุ',
    possibleIssue: 'พิมพ์ผิด ใช้รหัสเก่า หรือหมดเวลา',
    howToFix: 'ขอรหัส OTP ใหม่แล้วกรอกภายในเวลาที่กำหนด',
  },
  [ERROR_CODES.INVALID_PASSWORD]: {
    why: 'รหัสผ่านไม่ถูกต้อง',
    possibleIssue: 'พิมพ์ผิดหรือใช้รหัสผ่านเก่า',
    howToFix: 'ลองใหม่ หรือใช้ขั้นตอนรีเซ็ตรหัสผ่านหากมี',
  },
  [ERROR_CODES.INVALID_PHONE]: {
    why: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
    possibleIssue: 'ตัวเลขไม่ครบ หรือไม่ใช่เบอร์ไทยที่ระบบรองรับ',
    howToFix: 'กรอกเบอร์มือถือ 10 หลัก เช่น 08xxxxxxxx',
  },
  [ERROR_CODES.INVALID_REFRESH_TOKEN]: {
    why: 'โทเคนรีเฟรชเซสชันไม่ถูกต้องหรือหมดอายุ',
    possibleIssue: 'ออกจากระบบไปนาน หรือเซสชันถูกเพิกถอน',
    howToFix: 'เข้าสู่ระบบใหม่อีกครั้ง',
  },
  [ERROR_CODES.INVALID_TOKEN]: {
    why: 'ลิงก์หรือโทเคนไม่ถูกต้อง',
    possibleIssue: 'ลิงก์ถูกตัด หรือใช้โทเคนผิดประเภท',
    howToFix: 'เปิดลิงก์จากอีเมล/SMS ฉบับล่าสุด หรือขอใหม่อีกครั้ง',
  },
  [ERROR_CODES.PHONE_ALREADY_EXISTS]: {
    why: 'เบอร์โทรนี้ผูกกับบัญชีอื่นแล้ว',
    possibleIssue: 'เคยสมัครด้วยเบอร์นี้ หรือกรอกเบอร์ซ้ำ',
    howToFix: 'เข้าสู่ระบบด้วยเบอร์เดิม หรือใช้เบอร์อื่น',
  },
  [ERROR_CODES.PHONE_UNCHANGED]: {
    why: 'เบอร์ใหม่ต้องต่างจากเบอร์ปัจจุบัน',
    possibleIssue: 'กรอกเบอร์เดิมซ้ำ',
    howToFix: 'กรอกเบอร์โทรศัพท์ใหม่ที่ต้องการเปลี่ยน',
  },
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
    why: 'มีการร้องขอมากเกินไปในระยะเวลาสั้น ๆ',
    possibleIssue: 'กดขอ OTP หรือส่งคำขอซ้ำถี่เกินไป',
    howToFix: 'รอสักครู่แล้วลองใหม่',
  },
  [ERROR_CODES.SESSION_EXPIRED]: {
    why: 'เซสชันหมดอายุ',
    possibleIssue: 'ไม่ได้ใช้งานนาน หรือออกจากระบบจากอุปกรณ์อื่น',
    howToFix: 'เข้าสู่ระบบใหม่อีกครั้ง',
  },
  [ERROR_CODES.SMS_DELIVERY_FAILED]: {
    why: 'ระบบส่ง SMS ไม่สำเร็จ',
    possibleIssue: 'เบอร์รับข้อความมีปัญหา หรือผู้ให้บริการ SMS ขัดข้องชั่วคราว',
    howToFix: 'ตรวจสอบเบอร์โทรแล้วขอรหัสใหม่อีกครั้ง หากยังไม่ได้ให้ติดต่อฝ่ายสนับสนุน',
  },
  [ERROR_CODES.TOKEN_EXPIRED]: {
    why: 'ลิงก์หรือโทเคนหมดอายุแล้ว',
    possibleIssue: 'เปิดลิงก์ช้าเกินไป',
    howToFix: 'ขอลิงก์หรือรหัสใหม่อีกครั้ง',
  },
  [ERROR_CODES.TOO_MANY_ATTEMPTS]: {
    why: 'พยายามยืนยันหลายครั้งเกินไป',
    possibleIssue: 'กรอก OTP หรือรหัสผิดซ้ำ ๆ',
    howToFix: 'รอสักครู่แล้วขอรหัสใหม่',
  },
  [ERROR_CODES.UNAUTHENTICATED]: {
    why: 'ยังไม่ได้ยืนยันตัวตนหรือเซสชันไม่ถูกต้อง',
    possibleIssue: 'ยังไม่ล็อกอิน หรือคุกกี้เซสชันหาย',
    howToFix: 'เข้าสู่ระบบใหม่อีกครั้ง',
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    why: 'ไม่มีสิทธิ์หรือยังไม่ได้เข้าสู่ระบบ',
    possibleIssue: 'เซสชันหมดอายุ หรือเรียก API ที่ต้องล็อกอิน',
    howToFix: 'เข้าสู่ระบบใหม่อีกครั้ง',
  },

  // —— Cart / Checkout ——
  [ERROR_CODES.ADDRESS_NOT_FOUND]: {
    why: 'ไม่พบที่อยู่ที่เลือก',
    possibleIssue: 'ที่ถูกลบแล้ว หรือรหัสที่อยู่ไม่ถูกต้อง',
    howToFix: 'เลือกที่อยู่อื่นหรือเพิ่มที่อยู่ใหม่',
  },
  [ERROR_CODES.CART_IDENTITY_REQUIRED]: {
    why: 'ระบบระบุตะกร้าไม่ได้',
    possibleIssue: 'คุกกี้เซสชันหาย หรือข้อมูลแขกไม่ครบ',
    howToFix: 'รีเฟรชหน้าแล้วลองใหม่ หรือเข้าสู่ระบบ',
  },
  [ERROR_CODES.CART_ITEM_NOT_FOUND]: {
    why: 'ไม่พบรายการในตะกร้า',
    possibleIssue: 'สินค้าถูกลบไปแล้ว หรือตะกร้าถูกอัปเดต',
    howToFix: 'รีเฟรชตะกร้าแล้วเลือกสินค้าใหม่',
  },
  [ERROR_CODES.INSUFFICIENT_STOCK]: {
    why: 'จำนวนในสต็อกน้อยกว่าที่สั่ง',
    possibleIssue: 'สินค้าขายหมดหรือเหลือไม่พอ',
    howToFix: 'ลดจำนวนหรือเลือกสินค้าอื่น',
  },
  [ERROR_CODES.INVALID_ADDRESS]: {
    why: 'ข้อมูลที่อยู่ไม่ผ่านการตรวจสอบ',
    possibleIssue: 'จังหวัด/เขต/รหัสไปรษณีย์ไม่สอดคล้องกัน',
    howToFix: 'ตรวจสอบและแก้ไขที่อยู่จัดส่งให้ครบถ้วน',
  },
  [ERROR_CODES.INVALID_SHIPPING_ADDRESS]: {
    why: 'ที่อยู่จัดส่งไม่ถูกต้อง',
    possibleIssue: 'ข้อมูลไม่ครบหรืออยู่นอกพื้นที่จัดส่ง',
    howToFix: 'แก้ไขที่อยู่หรือเลือกที่อยู่อื่น',
  },
  [ERROR_CODES.INVALID_SHIPPING_OPTION]: {
    why: 'ตัวเลือกจัดส่งที่เลือกใช้ไม่ได้',
    possibleIssue: 'ร้านปิดตัวเลือกนี้ หรือไม่รองรับที่อยู่ปัจจุบัน',
    howToFix: 'เลือกวิธีจัดส่งอื่นที่ร้านเปิดใช้งาน',
  },
  [ERROR_CODES.MULTI_VENDOR_ORDER]: {
    why: 'คำสั่งซื้อมีสินค้าจากหลายร้านในรูปแบบที่ไม่รองรับ',
    possibleIssue: 'ตะกร้ารวมหลายร้านในขั้นตอนที่ต้องแยกออเดอร์',
    howToFix: 'สั่งซื้อแยกร้านตามที่ระบบแนะนำ',
  },
  [ERROR_CODES.ORDER_CONTAINS_SUSPENDED_STORE]: {
    why: 'มีสินค้าจากร้านที่ถูกระงับอยู่ในคำสั่งซื้อ',
    possibleIssue: 'ร้านถูกระงับหลังจากเพิ่มสินค้าลงตะกร้า',
    howToFix: 'ลบสินค้าจากร้านที่ถูกระงับออกจากตะกร้าแล้วลองใหม่',
  },
  [ERROR_CODES.PRODUCT_NOT_FOUND]: {
    why: 'ไม่พบสินค้าที่อ้างอิง',
    possibleIssue: 'สินค้าถูกลบ เลิกขาย หรือลิงก์หมดอายุ',
    howToFix: 'ค้นหาสินค้าอื่นหรือกลับไปหน้าร้าน',
  },
  [ERROR_CODES.QUANTITY_TOO_LARGE]: {
    why: 'จำนวนที่สั่งเกินขีดจำกัด',
    possibleIssue: 'ใส่จำนวนมากเกินไปต่อรายการ',
    howToFix: 'ลดจำนวนสินค้าแล้วลองใหม่',
  },
  [ERROR_CODES.SAVED_ADDRESS_NOT_FOUND]: {
    why: 'ไม่พบที่อยู่ที่บันทึกไว้',
    possibleIssue: 'ที่อยู่ถูกลบจากบัญชีแล้ว',
    howToFix: 'เลือกหรือเพิ่มที่อยู่ใหม่',
  },
  [ERROR_CODES.SAVED_ADDRESS_REQUIRES_LOGIN]: {
    why: 'ที่อยู่ที่บันทึกใช้ได้เฉพาะสมาชิก',
    possibleIssue: 'สั่งซื้อแบบแขกแต่เลือกที่อยู่ที่บันทึก',
    howToFix: 'เข้าสู่ระบบ หรือกรอกที่อยู่ใหม่',
  },
  [ERROR_CODES.SHIPPING_ADDRESS_REQUIRED]: {
    why: 'ยังไม่ได้ระบุที่อยู่จัดส่ง',
    possibleIssue: 'ข้ามขั้นตอนกรอกที่อยู่',
    howToFix: 'กรอกหรือเลือกที่อยู่จัดส่งก่อนชำระเงิน',
  },
  [ERROR_CODES.SHIPPING_OPTION_NOT_FOUND]: {
    why: 'ไม่พบตัวเลือกจัดส่งที่เลือก',
    possibleIssue: 'ร้านปิดหรือลบตัวเลือกนี้แล้ว',
    howToFix: 'เลือกวิธีจัดส่งใหม่',
  },
  [ERROR_CODES.SHIPPING_OPTION_REQUIRED]: {
    why: 'ยังไม่ได้เลือกวิธีจัดส่ง',
    possibleIssue: 'ข้ามขั้นตอนเลือกการจัดส่ง',
    howToFix: 'เลือกวิธีจัดส่งก่อนดำเนินการต่อ',
  },
  [ERROR_CODES.STORE_SUSPENDED]: {
    why: 'ร้านค้าถูกระงับชั่วคราว',
    possibleIssue: 'ร้านถูกระงับโดยแพลตฟอร์ม',
    howToFix: 'ไม่สามารถเพิ่มสินค้าจากร้านนี้ได้ในขณะนี้ เลือกสินค้าจากร้านอื่น',
  },
  [ERROR_CODES.SUSPENDED_STORE_ITEM_REMOVED]: {
    why: 'ระบบลบสินค้าจากร้านที่ถูกระงับออกจากตะกร้า',
    possibleIssue: 'ร้านถูกระงับขณะมีสินค้าในตะกร้า',
    howToFix: 'ตรวจสอบตะกร้าอีกครั้งและสั่งซื้อจากร้านที่ยังเปิดอยู่',
  },
  [ERROR_CODES.VARIANT_NOT_FOUND]: {
    why: 'ไม่พบตัวเลือกสินค้า (SKU)',
    possibleIssue: 'ตัวเลือกถูกลบหรือเลิกขาย',
    howToFix: 'เลือกตัวเลือกอื่นหรือสินค้าอื่น',
  },
  [ERROR_CODES.VARIANT_REQUIRED]: {
    why: 'สินค้านี้ต้องเลือกตัวเลือกก่อน',
    possibleIssue: 'ยังไม่ได้เลือกขนาด/สี หรือตัวเลือกอื่น',
    howToFix: 'เลือกตัวเลือกสินค้าให้ครบก่อนเพิ่มลงตะกร้า',
  },

  // —— Orders / Payments ——
  [ERROR_CODES.BANK_TRANSFER_FIELD_REQUIRED]: {
    why: 'ข้อมูลการโอนยังไม่ครบ',
    possibleIssue: 'ขาดสลิป วันที่โอน หรือยอดเงิน',
    howToFix: 'กรอกข้อมูลการโอนและแนบหลักฐานให้ครบ',
  },
  [ERROR_CODES.BANK_TRANSFER_NOT_CONFIGURED]: {
    why: 'ช่องทางโอนธนาคารยังไม่พร้อม',
    possibleIssue: 'แพลตฟอร์มยังไม่ได้ตั้งค่าบัญชีรับโอน',
    howToFix: 'เลือกวิธีชำระเงินอื่น หรือลองใหม่ภายหลัง',
  },
  [ERROR_CODES.CARD_TOKEN_REQUIRED]: {
    why: 'ยังไม่มีโทเคนบัตรสำหรับชำระเงิน',
    possibleIssue: 'กรอกบัตรไม่ครบ หรือ Omise ยังไม่สร้างโทเคน',
    howToFix: 'กรอกข้อมูลบัตรให้ครบแล้วลองชำระอีกครั้ง',
  },
  [ERROR_CODES.HOLD_CANCEL_FORBIDDEN]: {
    why: 'รายการถูกพักเพราะร้านถูกระงับ จึงยกเลิกเองไม่ได้',
    possibleIssue: 'ออเดอร์อยู่ในสถานะพักจากการระงับร้าน',
    howToFix: 'ติดต่อฝ่ายสนับสนุนหากต้องการความช่วยเหลือ',
  },
  [ERROR_CODES.HOLD_TRANSITION_FORBIDDEN]: {
    why: 'ไม่สามารถเปลี่ยนสถานะรายการที่ถูกพักได้',
    possibleIssue: 'ร้านยังถูกระงับอยู่',
    howToFix: 'รอร้านกลับมาเปิด หรือติดต่อฝ่ายสนับสนุน',
  },
  [ERROR_CODES.OMISE_ERROR]: {
    why: 'ระบบชำระเงิน Omise คืนข้อผิดพลาด',
    possibleIssue: 'บัตรถูกปฏิเสธ เครือข่ายขัดข้อง หรือข้อมูลบัตรผิด',
    howToFix: 'ตรวจสอบบัตร/ยอดเงิน แล้วลองใหม่ หรือใช้วิธีชำระอื่น',
  },
  [ERROR_CODES.OMISE_NOT_CONFIGURED]: {
    why: 'ระบบชำระเงินยังไม่พร้อมใช้งาน',
    possibleIssue: 'สภาพแวดล้อมยังไม่ได้ตั้งค่า Omise',
    howToFix: 'ลองใหม่ภายหลัง หรือติดต่อฝ่ายสนับสนุน',
  },
  [ERROR_CODES.ORDER_ALREADY_CANCELLED]: {
    why: 'คำสั่งซื้อถูกยกเลิกไปแล้ว',
    possibleIssue: 'ยกเลิกซ้ำ หรือลิงก์ชำระเงินของออเดอร์ที่ยกเลิกแล้ว',
    howToFix: 'สร้างคำสั่งซื้อใหม่หากยังต้องการสินค้า',
  },
  [ERROR_CODES.ORDER_NOT_FOUND]: {
    why: 'ไม่พบคำสั่งซื้อ',
    possibleIssue: 'รหัสออเดอร์ผิด หรือไม่ใช่ของบัญชีนี้',
    howToFix: 'ตรวจสอบประวัติคำสั่งซื้อในบัญชีของคุณ',
  },
  [ERROR_CODES.ORDER_NOT_PAYABLE]: {
    why: 'คำสั่งซื้อหมดเวลาชำระหรือถูกยกเลิกแล้ว',
    possibleIssue: 'เกินเวลาชำระเงิน หรือสถานะออเดอร์ไม่ใช่รอชำระ',
    howToFix: 'สร้างคำสั่งซื้อใหม่แล้วชำระภายในเวลาที่กำหนด',
  },
  [ERROR_CODES.ORDER_NOT_REVIEWABLE]: {
    why: 'ยังไม่ถึงเงื่อนไขการรีวิว',
    possibleIssue: 'ออเดอร์ยังไม่จัดส่งครบ หรืออยู่นอกช่วงรีวิว',
    howToFix: 'รอจนกว่าสินค้าจะจัดส่งสำเร็จภายในช่วงเวลาที่กำหนด',
  },
  [ERROR_CODES.PAYMENT_HELD_PORTION_BLOCKED]: {
    why: 'ส่วนที่ถูกพักจากการระงับร้านยังชำระไม่ได้',
    possibleIssue: 'ร้านของรายการนั้นถูกระงับชั่วคราว',
    howToFix: 'ชำระเฉพาะส่วนที่ยังดำเนินการได้ หรือรอร้านกลับมาเปิด',
  },
  [ERROR_CODES.PAYMENT_METHOD_ALREADY_EXISTS]: {
    why: 'บัตรนี้ถูกบันทึกไว้แล้ว',
    possibleIssue: 'เพิ่มบัตรซ้ำ',
    howToFix: 'เลือกบัตรที่มีอยู่แล้ว หรือใช้บัตรอื่น',
  },
  [ERROR_CODES.PAYMENT_METHOD_NOT_FOUND]: {
    why: 'ไม่พบวิธีการชำระเงินที่เลือก',
    possibleIssue: 'บัตรถูกลบแล้ว หรือรหัสไม่ถูกต้อง',
    howToFix: 'เลือกหรือเพิ่มวิธีชำระเงินใหม่',
  },
  [ERROR_CODES.PAYMENT_NOT_CONFIRMABLE]: {
    why: 'สถานะการชำระเงินไม่อยู่ในขั้นที่ยืนยันได้',
    possibleIssue: 'ชำระไปแล้ว หมดอายุ หรือถูกยกเลิก',
    howToFix: 'รีเฟรชหน้าสถานะการชำระเงิน หรือสั่งซื้อใหม่',
  },
  [ERROR_CODES.PAYMENT_NOT_FOUND]: {
    why: 'ไม่พบรายการชำระเงิน',
    possibleIssue: 'ลิงก์ชำระเงินผิด หรือรายการถูกลบ',
    howToFix: 'เปิดจากประวัติคำสั่งซื้อ หรือติดต่อฝ่ายสนับสนุน',
  },
  [ERROR_CODES.USE_CONFIRM_BANK_TRANSFER]: {
    why: 'ต้องยืนยันการโอนผ่านช่องทางที่กำหนด',
    possibleIssue: 'เรียก API ชำระเงินทั่วไปแทนการยืนยันโอน',
    howToFix: 'ใช้ขั้นตอนยืนยันการโอนธนาคารตามที่ระบบกำหนด',
  },

  // —— Promotions ——
  [ERROR_CODES.ACCOUNT_AGE]: {
    why: 'บัญชียังไม่เข้าเงื่อนไขอายุบัญชีของโปรโมชัน',
    possibleIssue: 'โปรสำหรับบัญชีที่สมัครมานานพอ หรือลูกค้าใหม่ตามนิยามโปร',
    howToFix: 'ใช้โปรอื่นที่เข้าเงื่อนไข หรือรอจนบัญชีเข้าเงื่อนไข',
  },
  [ERROR_CODES.GUEST]: {
    why: 'โปรโมชันนี้สำหรับสมาชิกเท่านั้น',
    possibleIssue: 'ยังไม่ได้เข้าสู่ระบบ',
    howToFix: 'เข้าสู่ระบบหรือสมัครสมาชิกแล้วใช้โค้ดอีกครั้ง',
  },
  [ERROR_CODES.INSUFFICIENT_QTY]: {
    why: 'จำนวนสินค้ายังไม่ครบเงื่อนไขซื้อแถม',
    possibleIssue: 'ยังขาดชิ้นตามเงื่อนไข BxGy',
    howToFix: 'เพิ่มสินค้าในโปรให้ครบจำนวนที่กำหนด',
  },
  [ERROR_CODES.INVALID_PROMOTION]: {
    why: 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ',
    possibleIssue: 'พิมพ์โค้ดผิด หรือโปรถูกปิดแล้ว',
    howToFix: 'ตรวจสอบโค้ดอีกครั้ง หรือเลือกโปรจากรายการที่ใช้ได้',
  },
  [ERROR_CODES.MISSING_LINES]: {
    why: 'ข้อมูลตะกร้าไม่พอสำหรับตรวจสอบโปร',
    possibleIssue: 'ตะกร้าว่างหรือข้อมูลรายการไม่ครบ',
    howToFix: 'เพิ่มสินค้าลงตะกร้าแล้วลองใช้โปรอีกครั้ง',
  },
  [ERROR_CODES.ORDER_HISTORY]: {
    why: 'โปรโมชันนี้สำหรับลูกค้าใหม่เท่านั้น',
    possibleIssue: 'เคยมีประวัติคำสั่งซื้อแล้ว',
    howToFix: 'ใช้โปรอื่นที่เปิดให้ลูกค้าทั่วไป',
  },
  [ERROR_CODES.PROMOTION_CUSTOMER_LIMIT]: {
    why: 'ใช้โค้ดนี้ครบจำนวนครั้งต่อบัญชีแล้ว',
    possibleIssue: 'เกินลิมิตต่อลูกค้า',
    howToFix: 'ใช้โค้ดอื่นที่ยังมีสิทธิ์',
  },
  [ERROR_CODES.PROMOTION_EXPIRED]: {
    why: 'โค้ดส่วนลดหมดอายุแล้ว',
    possibleIssue: 'เลยช่วงวันที่โปร',
    howToFix: 'ใช้โปรที่ยังเปิดอยู่',
  },
  [ERROR_CODES.PROMOTION_LIMIT]: {
    why: 'โค้ดถูกใช้ครบโควต้าแล้ว',
    possibleIssue: 'สิทธิ์ทั้งหมดถูกใช้ไปแล้ว',
    howToFix: 'ใช้โค้ดหรือโปรอื่น',
  },
  [ERROR_CODES.PROMOTION_MIN_PURCHASE]: {
    why: 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำของโปร',
    possibleIssue: 'ยอดในตะกร้าต่ำกว่าเงื่อนไข',
    howToFix: 'เพิ่มสินค้าให้ถึงยอดขั้นต่ำแล้วลองใหม่',
  },
  [ERROR_CODES.PROMOTION_NOT_FOUND]: {
    why: 'ไม่พบโค้ดส่วนลด',
    possibleIssue: 'โค้ดผิดหรือถูกลบ',
    howToFix: 'ตรวจสอบโค้ดหรือเลือกจากรายการโปร',
  },
  [ERROR_CODES.PROMOTION_NOT_STARTED]: {
    why: 'โค้ดยังไม่ถึงวันเริ่มใช้งาน',
    possibleIssue: 'ใช้โปรก่อนเวลา',
    howToFix: 'รอจนถึงวันเริ่มโปร หรือใช้โปรอื่น',
  },
  [ERROR_CODES.PROMOTION_SCOPE]: {
    why: 'โปรใช้ไม่ได้กับสินค้าในตะกร้า',
    possibleIssue: 'สินค้าอยู่นอกขอบเขตโปร',
    howToFix: 'เพิ่มสินค้าที่เข้าเงื่อนไข หรือใช้โปรอื่น',
  },
  [ERROR_CODES.PROMOTION_STORE]: {
    why: 'โปรใช้ได้เฉพาะร้านที่กำหนด',
    possibleIssue: 'ใช้โค้ดกับร้านอื่น',
    howToFix: 'ใช้กับร้านที่โปรระบุ หรือเลือกโปรของร้านนั้น',
  },

  // —— Account / reviews ——
  [ERROR_CODES.EMAIL_EXISTS]: {
    why: 'อีเมลนี้ถูกใช้งานแล้ว',
    possibleIssue: 'เคยสมัครด้วยอีเมลนี้',
    howToFix: 'ใช้อีเมลอื่น หรือเข้าสู่ระบบด้วยบัญชีเดิม',
  },
  [ERROR_CODES.EMAIL_TAKEN]: {
    why: 'อีเมลนี้ถูกใช้งานแล้ว',
    possibleIssue: 'อีเมลซ้ำในระบบ',
    howToFix: 'เลือกอีเมลอื่น',
  },
  [ERROR_CODES.REVIEW_ALREADY_EXISTS]: {
    why: 'รีวิวสินค้านี้ไปแล้ว',
    possibleIssue: 'ส่งรีวิวซ้ำสำหรับสินค้าในออเดอร์เดียวกัน',
    howToFix: 'แก้ไขรีวิวเดิมหากระบบรองรับ หรือรีวิวสินค้าอื่น',
  },
  [ERROR_CODES.REVIEW_WINDOW_EXPIRED]: {
    why: 'หมดช่วงเวลาที่อนุญาตให้รีวิว',
    possibleIssue: 'เลยกำหนดหลังจัดส่ง',
    howToFix: 'ไม่สามารถรีวิวออเดอร์นี้ได้อีก',
  },

  // —— Generic ——
  [ERROR_CODES.BAD_REQUEST]: {
    why: 'คำขอไม่ถูกต้องตามที่ระบบคาดหวัง',
    possibleIssue: 'ข้อมูลฟอร์มไม่ครบหรือรูปแบบผิด',
    howToFix: 'ตรวจสอบข้อมูลที่กรอกแล้วลองใหม่',
  },
  [ERROR_CODES.CONFLICT]: {
    why: 'ข้อมูลขัดแย้งกับสถานะปัจจุบัน',
    possibleIssue: 'รายการมีอยู่แล้ว หรือถูกแก้ไขโดยคนอื่นพร้อมกัน',
    howToFix: 'รีเฟรชหน้าแล้วดำเนินการใหม่',
  },
  [ERROR_CODES.FORBIDDEN]: {
    why: 'ไม่มีสิทธิ์ดำเนินการนี้',
    possibleIssue: 'บัญชีไม่มีสิทธิ์ หรือพยายามเข้าถึงของผู้อื่น',
    howToFix: 'เข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์ หรือติดต่อฝ่ายสนับสนุน',
  },
  [ERROR_CODES.GRAPHQL_ERROR]: {
    why: 'เกิดข้อผิดพลาดจาก API',
    possibleIssue: 'เซิร์ฟเวอร์หรือคำขอ GraphQL ล้มเหลว',
    howToFix: 'ลองใหม่อีกครั้ง หากเกิดซ้ำให้ติดต่อฝ่ายสนับสนุน',
  },
  [ERROR_CODES.HTTP_ERROR]: {
    why: 'คำขอเครือข่ายล้มเหลว',
    possibleIssue: 'เซิร์ฟเวอร์ตอบกลับผิดพลาด',
    howToFix: 'ตรวจสอบการเชื่อมต่อแล้วลองใหม่',
  },
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    why: 'เกิดข้อผิดพลาดภายในระบบ',
    possibleIssue: 'เซิร์ฟเวอร์ขัดข้องชั่วคราว',
    howToFix: 'ลองใหม่อีกครั้งในภายหลัง',
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    why: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้',
    possibleIssue: 'อินเทอร์เน็ตหลุด หรือไฟร์วอลล์บล็อก',
    howToFix: 'ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
  },
  [ERROR_CODES.NOT_FOUND]: {
    why: 'ไม่พบข้อมูลที่ร้องขอ',
    possibleIssue: 'ลิงก์ผิด หรือรายการถูกลบ',
    howToFix: 'กลับหน้าหลักหรือค้นหาใหม่อีกครั้ง',
  },
  [ERROR_CODES.TIMEOUT]: {
    why: 'การเชื่อมต่อหมดเวลา',
    possibleIssue: 'เครือข่ายช้าหรือเซิร์ฟเวอร์ตอบช้า',
    howToFix: 'ลองใหม่อีกครั้ง',
  },
  [ERROR_CODES.TOO_MANY_REQUESTS]: {
    why: 'มีการร้องขอมากเกินไป',
    possibleIssue: 'รีเฟรชหรือกดปุ่มซ้ำถี่เกินไป',
    howToFix: 'รอสักครู่แล้วลองใหม่',
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    why: 'เกิดข้อผิดพลาดที่ไม่ระบุรหัสชัดเจน',
    possibleIssue: 'ข้อผิดพลาดทั่วไปจากไคลเอนต์หรือเซิร์ฟเวอร์',
    howToFix: 'ลองใหม่อีกครั้ง หากยังไม่หายให้ติดต่อฝ่ายสนับสนุน',
  },
  [ERROR_CODES.UPLOAD_FAILED]: {
    why: 'อัปโหลดไฟล์ไม่สำเร็จ',
    possibleIssue: 'ไฟล์ใหญ่เกินไป เครือข่ายหลุด หรือประเภทไฟล์ไม่รองรับ',
    howToFix: 'ลดขนาดไฟล์ ตรวจสอบประเภทไฟล์ แล้วลองใหม่',
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    why: 'ข้อมูลไม่ผ่านการตรวจสอบ',
    possibleIssue: 'ฟิลด์บังคับว่าง หรือรูปแบบไม่ถูกต้อง',
    howToFix: 'แก้ไขตามข้อความใต้ช่องกรอกแล้วส่งใหม่',
  },
};
