import categories from "./category-data.json";
export { categories };
export function categorySlug(label: string) { return label.toLowerCase().replace(/[’']/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function categoryHref(label: string, parent?: string) {
 const slug = parent ? `${categorySlug(parent)}-${categorySlug(label)}` : categorySlug(label);
 const match = categories.find(c=>c.slug===slug) || categories.find(c=>categorySlug(c.title)===slug);
 return `/category/${match?.slug || "all-products"}`;
}
