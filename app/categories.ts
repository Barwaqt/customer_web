import categories from "./category-data.json";
export { categories };

export function categorySlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function categoryHref(
  label: string,
  parent?: string,
  liveCategories?: { slug: string; title?: string; name?: string; parent?: string | null }[]
) {
  if (!label || label.toLowerCase() === "all products" || label.toLowerCase() === "all categories") {
    return "/category/all-products";
  }

  const norm = categorySlug(label);
  const parentNorm = parent ? categorySlug(parent) : undefined;

  if (liveCategories && liveCategories.length > 0) {
    const combinedSlug = parentNorm ? `${parentNorm}-${norm}` : norm;
    // 1. Direct slug match
    const exactMatch = liveCategories.find(c => c.slug === norm || c.slug === combinedSlug);
    if (exactMatch) return `/category/${exactMatch.slug}`;

    // 2. Title/name match
    const titleMatch = liveCategories.find(c => {
      const titleSlug = categorySlug(c.title || c.name || "");
      if (titleSlug !== norm) return false;
      if (parentNorm) {
        return c.parent === parentNorm || categorySlug(c.parent || "") === parentNorm;
      }
      return true;
    });
    if (titleMatch) return `/category/${titleMatch.slug}`;
  }

  // 3. Static fallback
  const slug = parentNorm ? `${parentNorm}-${norm}` : norm;
  const match = categories.find(c => c.slug === slug || c.slug === norm) || categories.find(c => categorySlug(c.title) === norm);
  if (match) return `/category/${match.slug}`;

  // 4. Return computed slug directly
  return `/category/${slug}`;
}
