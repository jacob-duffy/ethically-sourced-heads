/**
 * Creates pagination controls (Previous, page indicator, Next).
 * @param {number} currentPage - Current page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback with (newPage: number)
 * @returns {HTMLElement}
 */
export function createPagination(currentPage, totalPages, onPageChange) {
    const container = document.createElement("div");
    container.style.cssText = `
        display:flex;
        justify-content:center;
        align-items:center;
        gap:16px;
        margin-top:40px;
        margin-bottom:40px;
    `;

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Previous";
    prevBtn.style.cssText = `
        padding:10px 16px;
        background:#3a6ea8;
        border:none;
        border-radius:6px;
        color:#fff;
        font-size:0.9rem;
        cursor:pointer;
        transition:background 0.2s;
    `;
    prevBtn.disabled = currentPage <= 1;
    prevBtn.style.opacity = currentPage <= 1 ? "0.5" : "1";
    prevBtn.addEventListener("mouseenter", () => {
        if (currentPage > 1) prevBtn.style.background = "#4d83c2";
    });
    prevBtn.addEventListener("mouseleave", () => {
        if (currentPage > 1) prevBtn.style.background = "#3a6ea8";
    });
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    });
    container.appendChild(prevBtn);

    // Page indicator
    const pageIndicator = document.createElement("div");
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    pageIndicator.style.cssText = "color:#999;font-size:0.9rem;min-width:100px;text-align:center;";
    container.appendChild(pageIndicator);

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.style.cssText = `
        padding:10px 16px;
        background:#3a6ea8;
        border:none;
        border-radius:6px;
        color:#fff;
        font-size:0.9rem;
        cursor:pointer;
        transition:background 0.2s;
    `;
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.style.opacity = currentPage >= totalPages ? "0.5" : "1";
    nextBtn.addEventListener("mouseenter", () => {
        if (currentPage < totalPages) nextBtn.style.background = "#4d83c2";
    });
    nextBtn.addEventListener("mouseleave", () => {
        if (currentPage < totalPages) nextBtn.style.background = "#3a6ea8";
    });
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
    container.appendChild(nextBtn);

    return container;
}
