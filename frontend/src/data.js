const HEADS_JSON_URL = "/heads.json";

/**
 * @typedef {Object} HeadPrice
 * @property {number} [diamonds]
 * @property {number} [emeralds]
 * @property {number} [iron]
 */

/**
 * @typedef {Object} Head
 * @property {string} name
 * @property {string} rarity
 * @property {string} texture_b64
 * @property {string} texture_url
 * @property {boolean} in_stock
 * @property {HeadPrice} price
 * @property {string[]} tags
 */

/** @type {Head[]} */
let _heads = [];

/**
 * Fetches and parses heads.json. Must be called once at startup.
 * @returns {Promise<Head[]>}
 */
export async function loadHeads() {
    const res = await fetch(HEADS_JSON_URL);
    if (!res.ok) throw new Error(`Failed to load heads.json: ${res.status}`);
    const data = await res.json();
    _heads = data.heads ?? [];
    return _heads;
}

/**
 * Returns all loaded heads. Throws if loadHeads() has not been called.
 * @returns {Head[]}
 */
export function getHeads() {
    return _heads;
}

// ─── Rarity ──────────────────────────────────────────────────────────────────

const RARITY_ORDER = ["Junk", "Uncommon", "Rare", "Legendary", "Player"];

/**
 * Returns all unique rarity values present in the loaded data, in tier order.
 * @returns {string[]}
 */
export function getRarities() {
    const present = new Set(_heads.map((h) => h.rarity));
    return RARITY_ORDER.filter((r) => present.has(r));
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

/**
 * Returns all unique tags present in the loaded data, sorted alphabetically.
 * @returns {string[]}
 */
export function getTags() {
    const tags = new Set(_heads.flatMap((h) => h.tags));
    return [...tags].sort();
}

// ─── Filter & Search ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} FilterOptions
 * @property {string} [search]        - Case-insensitive name substring match
 * @property {string} [rarity]        - Exact rarity match; omit or "" for all
 * @property {string[]} [tags]        - All listed tags must be present; [] for all
 * @property {boolean} [inStockOnly]  - If true, only return in-stock heads
 */

/**
 * Returns heads matching all provided filter criteria.
 * @param {FilterOptions} options
 * @returns {Head[]}
 */
export function filterHeads({ search = "", rarity = "", tags = [], inStockOnly = false } = {}) {
    const query = search.trim().toLowerCase();
    return _heads.filter((h) => {
        if (query && !h.name.toLowerCase().includes(query)) return false;
        if (rarity && h.rarity !== rarity) return false;
        if (tags.length && !tags.every((t) => h.tags.includes(t))) return false;
        if (inStockOnly && !h.in_stock) return false;
        return true;
    });
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

/**
 * @typedef {"name-asc"|"name-desc"|"rarity-asc"|"rarity-desc"|"price-asc"|"price-desc"} SortKey
 */

/**
 * Returns a sorted copy of the provided heads array.
 * Price sort uses total diamond-equivalent value (diamonds×1, emeralds×0.25, iron×0.02).
 * @param {Head[]} heads
 * @param {SortKey} sortKey
 * @returns {Head[]}
 */
export function sortHeads(heads, sortKey = "name-asc") {
    const copy = [...heads];

    const rarityIndex = (h) => RARITY_ORDER.indexOf(h.rarity);

    const priceValue = (h) =>
        (h.price.diamonds ?? 0) + (h.price.emeralds ?? 0) * 0.25 + (h.price.iron ?? 0) * 0.02;

    switch (sortKey) {
        case "name-asc":
            copy.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "name-desc":
            copy.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "rarity-asc":
            copy.sort((a, b) => rarityIndex(a) - rarityIndex(b));
            break;
        case "rarity-desc":
            copy.sort((a, b) => rarityIndex(b) - rarityIndex(a));
            break;
        case "price-asc":
            copy.sort((a, b) => priceValue(a) - priceValue(b));
            break;
        case "price-desc":
            copy.sort((a, b) => priceValue(b) - priceValue(a));
            break;
    }

    return copy;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Returns a single page of items from an array.
 * @param {Head[]} heads
 * @param {number} page    - 1-based page number
 * @param {number} perPage - Items per page
 * @returns {{ items: Head[], totalPages: number, page: number }}
 */
export function paginateHeads(heads, page = 1, perPage = 24) {
    const totalPages = Math.max(1, Math.ceil(heads.length / perPage));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * perPage;
    return {
        items: heads.slice(start, start + perPage),
        totalPages,
        page: safePage,
    };
}
