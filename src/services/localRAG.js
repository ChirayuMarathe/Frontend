export const LocalRAG = {
    /**
     * Search through CSV content for relevant rows based on query
     * @param {string} csvContent - The full CSV text
     * @param {string} query - User's question
     * @param {number} maxRows - Maximum rows to return (default 50)
     * @returns {string} - Formatted CSV snippet with header and relevant rows
     */
    searchCSV: (csvContent, query, maxRows = 50) => {
        try {
            const lines = csvContent.split("\n").filter(line => line.trim());
            if (lines.length === 0) return "";

            const header = lines[0];
            const dataRows = lines.slice(1);

            // key terms from query (ignoring stop words)
            const stopWords = ["the", "is", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "show", "me", "tell", "analyze", "find"];
            const keywords = query.toLowerCase()
                .split(/\W+/)
                .filter(w => w.length > 2 && !stopWords.includes(w));

            // If no specific keywords (e.g. "analyze this file"), return head + tail + random sample
            if (keywords.length === 0) {
                return getRepresentativeSample(header, dataRows, maxRows);
            }

            // Score rows
            const scoredRows = dataRows.map(row => {
                const rowLower = row.toLowerCase();
                let score = 0;

                // Exact keyword matching
                keywords.forEach(keyword => {
                    if (rowLower.includes(keyword)) score += 3;
                });

                // Date matching (simple Year checking)
                const years = query.match(/\b(19|20)\d{2}\b/g);
                if (years) {
                    years.forEach(year => {
                        if (rowLower.includes(year)) score += 10; // High priority for explicit years
                    });
                }

                return { row, score };
            });

            // Sort by score
            scoredRows.sort((a, b) => b.score - a.score);

            // Filter non-zero scores
            const relevantRows = scoredRows
                .filter(item => item.score > 0)
                .slice(0, maxRows)
                .map(item => item.row);

            // If we found nothing relevant, fall back to sample
            if (relevantRows.length === 0) {
                return getRepresentativeSample(header, dataRows, maxRows);
            }

            // Re-sort relevant rows by original index to keep time order if possible? 
            // Actually, for RAG, index order is better for time-series.
            // Let's try to find their original index.
            // Optimization: The 'scoredRows' map could preserve index.
            // But for now, returning sorted by relevance is okay, LLM can handle it.
            // BETTER: Sort relevant rows by date/index to maintain chronological order for checking trends.

            // Let's re-implement sort-by-index for the selected top N
            const topIndices = scoredRows
                .map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, maxRows)
                .map(item => item.originalIndex)
                .sort((a, b) => a - b); // Sort indices ascending

            const finalRows = topIndices.map(idx => dataRows[idx]);

            if (finalRows.length === 0) return getRepresentativeSample(header, dataRows, maxRows);

            return `CSV Context (Filtered for relevance):\n${header}\n${finalRows.join("\n")}\n...(Selected based on your query)...`;

        } catch (e) {
            console.error("LocalRAG search error:", e);
            return csvContent.substring(0, 5000); // Fallback
        }
    }
};

function getRepresentativeSample(header, dataRows, maxCount) {
    // Return start, middle, and end lines
    if (dataRows.length <= maxCount) {
        return header + "\n" + dataRows.join("\n");
    }

    const chunk = Math.floor(maxCount / 3);
    const start = dataRows.slice(0, chunk);
    const end = dataRows.slice(-chunk);

    // Random/Middle sample
    const middleIndex = Math.floor(dataRows.length / 2);
    const middle = dataRows.slice(middleIndex, middleIndex + chunk);

    return `CSV Preview (Sampled):\n${header}\n${start.join("\n")}\n...\n${middle.join("\n")}\n...\n${end.join("\n")}`;
}
