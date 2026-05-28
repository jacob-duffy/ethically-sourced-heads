import "./pagination.css";

/**
 * Creates pagination controls (Previous, page indicator, Next).
 * @param {number} currentPage - Current page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback with (newPage: number)
 * @returns {HTMLElement}
 */
export function createPagination(currentPage, totalPages, onPageChange) {
    const container = document.createElement("div");
    container.className = "pagination";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Previous";
    prevBtn.className = "pagination-btn";
    prevBtn.disabled = currentPage <= 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    });
    container.appendChild(prevBtn);

    const pageIndicator = document.createElement("div");
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    pageIndicator.className = "pagination-indicator";
    container.appendChild(pageIndicator);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.className = "pagination-btn";
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
    container.appendChild(nextBtn);

    return container;
}
