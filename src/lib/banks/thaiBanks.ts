/**
 * Thai banks for platform bank-transfer display (logos + name matching).
 * Codes align with Omise / admin `THAI_BANKS`. SVG logos from omise/banks-logo (MIT).
 */

export type ThaiBankBrand = {
  code: string;
  name: string;
  /** Brand color behind the white Omise SVG mark */
  color: string;
  /** Path under /public */
  logoSrc: string;
  /** Extra Thai/English match tokens (short names from legacy free text) */
  aliases: string[];
};

export const THAI_BANK_BRANDS: ThaiBankBrand[] = [
  {
    code: 'bbl',
    name: 'ธนาคารกรุงเทพ',
    color: '#1e4598',
    logoSrc: '/images/banks/bbl.svg',
    aliases: ['กรุงเทพ', 'bbl', 'bangkok bank'],
  },
  {
    code: 'kbank',
    name: 'ธนาคารกสิกรไทย',
    color: '#138f2d',
    logoSrc: '/images/banks/kbank.svg',
    aliases: ['กสิกร', 'กสิกรไทย', 'kbank', 'kasikorn'],
  },
  {
    code: 'ktb',
    name: 'ธนาคารกรุงไทย',
    color: '#1ba5e1',
    logoSrc: '/images/banks/ktb.svg',
    aliases: ['กรุงไทย', 'ktb', 'krungthai'],
  },
  {
    code: 'bay',
    name: 'ธนาคารกรุงศรีอยุธยา',
    color: '#fec43b',
    logoSrc: '/images/banks/bay.svg',
    aliases: ['กรุงศรี', 'กรุงศรีอยุธยา', 'bay', 'krungsri', 'ayudhya'],
  },
  {
    code: 'scb',
    name: 'ธนาคารไทยพาณิชย์',
    color: '#4e2e7f',
    logoSrc: '/images/banks/scb.svg',
    aliases: ['ไทยพาณิชย์', 'scb', 'siam commercial'],
  },
  {
    code: 'ttb',
    name: 'ธนาคารทหารไทยธนชาต',
    color: '#0050f0',
    logoSrc: '/images/banks/ttb.svg',
    aliases: ['ทหารไทย', 'ธนชาต', 'ttb', 'tmb', 'thanachart'],
  },
  {
    code: 'gsb',
    name: 'ธนาคารออมสิน',
    color: '#eb198d',
    logoSrc: '/images/banks/gsb.svg',
    aliases: ['ออมสิน', 'gsb'],
  },
  {
    code: 'uob',
    name: 'ธนาคารยูโอบี',
    color: '#0b3979',
    logoSrc: '/images/banks/uob.svg',
    aliases: ['ยูโอบี', 'uob'],
  },
  {
    code: 'cimb',
    name: 'ธนาคารซีไอเอ็มบี ไทย',
    color: '#7e2f36',
    logoSrc: '/images/banks/cimb.svg',
    aliases: ['ซีไอเอ็มบี', 'cimb'],
  },
  {
    code: 'kkp',
    name: 'ธนาคารเกียรตินาคินภัทร',
    color: '#199cc5',
    logoSrc: '/images/banks/kkp.svg',
    aliases: ['เกียรตินาคิน', 'kkp', 'kk', 'kiatnakin'],
  },
  {
    code: 'tisco',
    name: 'ธนาคารทิสโก้',
    color: '#12549f',
    logoSrc: '/images/banks/tisco.svg',
    aliases: ['ทิสโก้', 'tisco'],
  },
  {
    code: 'lhb',
    name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์',
    color: '#6d6e71',
    logoSrc: '/images/banks/lhb.svg',
    aliases: ['แลนด์', 'ลค', 'lhb', 'land and houses'],
  },
  {
    code: 'baac',
    name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร',
    color: '#4b9b1d',
    logoSrc: '/images/banks/baac.svg',
    aliases: ['ธ.ก.ส', 'ธกส', 'baac'],
  },
  {
    code: 'ghb',
    name: 'ธนาคารอาคารสงเคราะห์',
    color: '#f57d23',
    logoSrc: '/images/banks/ghb.svg',
    aliases: ['อาคารสงเคราะห์', 'ธอส', 'ghb'],
  },
  {
    code: 'ibank',
    name: 'ธนาคารอิสลามแห่งประเทศไทย',
    color: '#184615',
    logoSrc: '/images/banks/ibank.svg',
    aliases: ['อิสลาม', 'ibank', 'islamic'],
  },
];

function normalizeBankQuery(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Resolve admin-selected bankName (or legacy free text) to a brand with logo. */
export function resolveThaiBankBrand(bankName: string): ThaiBankBrand | null {
  const query = normalizeBankQuery(bankName);
  if (!query) return null;

  const exact = THAI_BANK_BRANDS.find((bank) => normalizeBankQuery(bank.name) === query);
  if (exact) return exact;

  const byAlias = THAI_BANK_BRANDS.find((bank) =>
    bank.aliases.some((alias) => {
      const a = normalizeBankQuery(alias);
      return query === a || query.includes(a) || a.includes(query);
    }),
  );
  if (byAlias) return byAlias;

  const byNameContains = THAI_BANK_BRANDS.find((bank) => {
    const name = normalizeBankQuery(bank.name);
    const short = name.replace(/^ธนาคาร/, '');
    return query.includes(short) || short.includes(query.replace(/^ธนาคาร/, ''));
  });
  return byNameContains ?? null;
}
