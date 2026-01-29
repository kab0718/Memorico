/**
 * 流体的タイポグラフィスケール
 * Fluid typography scale using CSS clamp() for responsive text sizing
 */

/**
 * フォントサイズの流体スケール定数
 * Font size fluid scale constants
 */
export const fluidFontSize = {
  /** 極小テキスト: clamp(10px, 0.35vw + 10px, 13px) */
  xs: "clamp(10px, 0.35vw + 10px, 13px)",
  /** 小テキスト: clamp(10px, 0.45vw + 10px, 16px) */
  sm: "clamp(10px, 0.45vw + 10px, 16px)",
  /** ラベル用: clamp(12px, 0.35vw + 11px, 14px) */
  label: "clamp(12px, 0.35vw + 11px, 14px)",
  /** 本文: clamp(14px, 0.55vw + 12px, 17px) */
  body: "clamp(14px, 0.55vw + 12px, 17px)",
  /** 見出し4: clamp(15px, 0.7vw + 14px, 18px) */
  heading4: "clamp(15px, 0.7vw + 14px, 18px)",
  /** 見出し3: clamp(16px, 0.8vw + 16px, 20px) */
  heading3: "clamp(16px, 0.8vw + 16px, 20px)",
  /** Mantine Text xs: clamp(12px, 0.35vw + 10.5px, 13.5px) */
  mantineXs: "clamp(12px, 0.35vw + 10.5px, 13.5px)",
  /** Mantine Text sm: clamp(13px, 0.4vw + 11.5px, 14.5px) */
  mantineSm: "clamp(13px, 0.4vw + 11.5px, 14.5px)",
} as const;

/**
 * その他の流体スケール定数
 * Other fluid scale constants
 */
export const fluidScale = {
  /** ロゴ高さ: clamp(40px, 4vw, 68px) */
  logoHeight: "clamp(40px, 4vw, 68px)",
} as const;

/**
 * ExifDetail コンポーネント用の流体スケール定数
 * Fluid scale constants for ExifDetail component
 */
export const exifDetailFluid = {
  /** 撮影日時: clamp(10px, 0.45vw + 10px, 13px) */
  shootingDate: "clamp(10px, 0.45vw + 10px, 13px)",
  /** ラベルオーバーライド: clamp(10px, 0.35vw + 10px, 13px) */
  labelOverride: "clamp(10px, 0.35vw + 10px, 13px)",
  /** 入力オーバーライド: clamp(10px, 0.45vw + 10px, 14px) */
  inputOverride: "clamp(10px, 0.45vw + 10px, 14px)",
} as const;
