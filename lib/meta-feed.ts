import type { MlItem } from "./ml";

export type MetaFeedRow = {
  id: string;
  item_group_id: string;
  title: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new" | "used";
  price: string;
  link: string;
  image_link: string;
  additional_image_link: string;
  brand: string;
  custom_label_0?: string;
  custom_label_1?: string;
  "video[0].url"?: string;
  "video[0].tag[0]"?: string;
  "video[1].url"?: string;
  "video[1].tag[0]"?: string;
};

function extractBrand(item: MlItem): string {
  const brandAttr = item.attributes?.find((a) => a.id === "BRAND");
  return brandAttr?.value_name || "Genérico";
}

export function toMetaRow(
  item: MlItem,
  description: string,
  overrides?: { title?: string | null; price?: number | null; image_url?: string | null; video_url?: string | null; video_url_square?: string | null; additional_image_urls?: string[], custom_label_0?: string, custom_label_1?: string },
  options?: { id_suffix?: string; item_group_id?: string }
): MetaFeedRow {
  return {
    id: options?.id_suffix ? `${item.id}${options.id_suffix}` : item.id,
    item_group_id: options?.item_group_id || item.id,
    title: overrides?.title || item.title,
    description: description || overrides?.title || item.title,
    availability: (item.status === "active" && item.available_quantity > 0) ? "in stock" : "out of stock",
    condition: item.condition === "used" ? "used" : "new",
    price: `${(overrides?.price || item.price).toFixed(2)} BRL`,
    link: item.permalink,
    image_link: "", // Isolado para teste, antes era: overrides?.image_url || item.pictures?.[0]?.secure_url || item.thumbnail
    additional_image_link: overrides?.additional_image_urls?.join(",") || "",
    brand: extractBrand(item),
    custom_label_0: overrides?.custom_label_0 || "",
    custom_label_1: overrides?.custom_label_1 || "",
    "video[0].url": overrides?.video_url_square || overrides?.video_url || "",
    "video[0].tag[0]": overrides?.video_url_square ? "1:1" : (overrides?.video_url ? "9:16" : ""),
    "video[1].url": (overrides?.video_url_square && overrides?.video_url) ? overrides?.video_url : "",
    "video[1].tag[0]": (overrides?.video_url_square && overrides?.video_url) ? "9:16" : "",
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
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "custom_label_0",
  "custom_label_1",
  "video[0].url",
  "video[0].tag[0]",
  "video[1].url",
  "video[1].tag[0]"
];

function escapeCsv(val: unknown): string {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: MetaFeedRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const row of rows) {
    lines.push(HEADERS.map((h) => escapeCsv(row[h])).join(","));
  }
  return lines.join("\n");
}
