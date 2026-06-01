import "./styles/tag-badge.css";

export function createTagBadge(tagName) {
  const badge = document.createElement("span");
  badge.className = "tag-badge";

  // tagName is already the category (fish, bird, mammal, etc.)
  badge.classList.add(`tag-badge--${tagName}`);

  badge.textContent = tagName.charAt(0).toUpperCase() + tagName.slice(1);
  badge.title = tagName;

  return badge;
}

export function createTagsContainer(tags) {
  const container = document.createElement("div");
  container.className = "tags-container";

  if (!tags || tags.length === 0) {
    return container;
  }

  for (const tag of tags) {
    container.appendChild(createTagBadge(tag));
  }

  return container;
}
