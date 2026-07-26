import type { MlItem } from "./ml";

export type MetaFeedRow = {
  id: string;
  item_group_id: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new" | "used";
  price: string;
  sale_price: string;
  sale_price_effective_date: string;
  link: string;
  image_link: string;
  additional_image_link: string;
  brand: string;
  google_product_category: string;
  inventory: string;
  custom_label_0: string;
  custom_label_1: string;
  custom_label_2: string;
  custom_label_3: string;
  custom_label_4: string;
  video_url: string;
  video_link: string;
  video: string;
  "video[0].url": string;
  "video[1].url": string;
};

function extractBrand(item: MlItem): string {
  const brandAttr = item.attributes?.find((a) => a.id === "BRAND");
  return brandAttr?.value_name || "Genérico";
}

/** Format a number to Meta price format: "299.90 BRL" */
function formatPrice(value: number): string {
  return `${value.toFixed(2)} BRL`;
}

export type MetaOverrides = {
  title?: string | null;
  description?: string | null;
  price?: number | null;
  sale_price?: number | null;
  sale_price_effective_date?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  video_url_square?: string | null;
  additional_image_urls?: string[];
  google_product_category?: string | null;
  inventory?: number | null;
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
};

export type MetaRowOptions = {
  id_suffix?: string;
  item_group_id?: string;
  enrich_title?: boolean;
};

export function toMetaRow(
  item: MlItem,
  description: string,
  overrides?: MetaOverrides,
  options?: MetaRowOptions
): MetaFeedRow {
  const originalPrice = overrides?.price || item.price;
  const salePrice = overrides?.sale_price;

  // Build additional images: combine ML pictures (skip first, it's the main image) with overrides
  let additionalImages: string[] = overrides?.additional_image_urls || [];
  if (additionalImages.length === 0 && item.pictures && item.pictures.length > 1) {
    additionalImages = item.pictures
      .slice(1, 11) // Max 10 additional images per Meta spec
      .map((p) => p.secure_url)
      .filter(Boolean);
  }

  // Holy Grail Title Enrichment with Social Proof & Urgency triggers
  let rawTitle = overrides?.title || item.title;
  if (options?.enrich_title !== false && !rawTitle.includes("🔥") && !rawTitle.includes("⚡") && !rawTitle.includes("PROMO")) {
    if (rawTitle.length <= 130) {
      rawTitle = `${rawTitle} - 🔥 +500 Vendidos`;
    }
  }

  const v1 = overrides?.video_url || overrides?.video_url_square || "";
  const v2 = (overrides?.video_url && overrides?.video_url_square) ? overrides.video_url_square : "";

  // Build JSON video array format recommended by Meta
  const videoList: { url: string }[] = [];
  if (v1) videoList.push({ url: v1 });
  if (v2) videoList.push({ url: v2 });
  const videoJson = videoList.length > 0 ? JSON.stringify(videoList) : "";

  return {
    id: options?.id_suffix ? `${item.id}${options.id_suffix}` : item.id,
    item_group_id: options?.item_group_id || item.id,
    title: rawTitle,
    description: overrides?.description || description || item.title,
    availability: (item.status === "active" && item.available_quantity > 0) ? "in stock" : "out of stock",
    condition: item.condition === "used" ? "used" : "new",
    price: formatPrice(originalPrice),
    sale_price: salePrice ? formatPrice(salePrice) : "",
    sale_price_effective_date: overrides?.sale_price_effective_date || "",
    link: item.permalink,
    image_link: overrides?.image_url || item.pictures?.[0]?.secure_url || item.thumbnail,
    additional_image_link: additionalImages.join(","),
    brand: extractBrand(item),
    google_product_category: overrides?.google_product_category || "",
    inventory: overrides?.inventory != null ? String(overrides.inventory) : (item.available_quantity > 0 ? String(item.available_quantity) : "0"),
    custom_label_0: overrides?.custom_label_0 || "",
    custom_label_1: overrides?.custom_label_1 || "",
    custom_label_2: overrides?.custom_label_2 || "",
    custom_label_3: overrides?.custom_label_3 || "",
    custom_label_4: overrides?.custom_label_4 || "",
    video_url: v1,
    video_link: v1,
    video: videoJson,
    "video[0].url": v1,
    "video[1].url": v2,
  };
}

const HEADERS: (keyof MetaFeedRow)[] = [
  "id",
  "item_group_id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "sale_price",
  "sale_price_effective_date",
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "google_product_category",
  "inventory",
  "custom_label_0",
  "custom_label_1",
  "custom_label_2",
  "custom_label_3",
  "custom_label_4",
  "video[0].url",
  "video[1].url"
];

const PINTEREST_HEADERS: (keyof MetaFeedRow)[] = [
  "id",
  "item_group_id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "sale_price",
  "sale_price_effective_date",
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "google_product_category",
  "inventory",
  "custom_label_0",
  "custom_label_1",
  "custom_label_2",
  "custom_label_3",
  "custom_label_4",
  "video_link"
];

function escapeCsv(val: unknown): string {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: MetaFeedRow[], platform: "meta" | "pinterest" = "meta"): string {
  const headers = platform === "pinterest" ? PINTEREST_HEADERS : HEADERS;
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(","));
  }
  return lines.join("\n");
}

