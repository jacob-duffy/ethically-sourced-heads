import "./styles/tag-badge.css";

export function createTagBadge(tags) {
  const badge = document.createElement("span");
  badge.className = "tag-badge";
  badge.classList.add("tag-badge");
  badge.textContent = tags.map(t => 
    t.charAt(0).toUpperCase() + t.slice(1))
    .sort((a, b) => a.localeCompare(b))
    .join(", ");
  return badge;
}

export function createTagsContainer(tags) {
  const container = document.createElement("div");
  container.className = "tags-container";
  if (!tags || tags.length === 0) return container;
  container.appendChild(createTagBadge(tags));
  return container;
}
