const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
const TAVILY_API_URL = 'https://api.tavily.com/search';

export const WebSearchService = {
    /**
     * Search using Tavily API for comprehensive web search
     * @param {string} query 
     * @returns {Promise<string>}
     */
    search: async (query) => {
        try {
            if (!TAVILY_API_KEY) {
                console.error("WebSearch: TAVILY_API_KEY is missing!");
                return "Web search is currently unavailable (API key missing).";
            }
            console.log(`WebSearch: Searching Tavily for "${query}"...`);
            
            const response = await fetch(TAVILY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TAVILY_API_KEY}`
                },
                body: JSON.stringify({
                    query: query,
                    search_depth: 'advanced',
                    include_answer: true,
                    include_raw_content: false,
                    max_results: 5,
                    include_images: false,
                    include_domains: [],
                    exclude_domains: []
                })
            });

            if (!response.ok) {
                console.error('Tavily API error:', await response.text());
                return "";
            }

            const data = await response.json();
            let results = [];

            // Add answer if available
            if (data.answer) {
                results.push(`Answer: ${data.answer}`);
            }

            // Add search results
            if (data.results && data.results.length > 0) {
                results.push('\nSearch Results:');
                data.results.slice(0, 3).forEach((result, index) => {
                    results.push(`\n${index + 1}. ${result.title}`);
                    results.push(`   ${result.url}`);
                    if (result.content) {
                        results.push(`   ${result.content.substring(0, 150)}...`);
                    }
                });
            }

            // Add related queries if available
            if (data.related_queries && data.related_queries.length > 0) {
                results.push('\nRelated Queries:');
                results.push(...data.related_queries.slice(0, 3).map(q => `- ${q}`));
            }

            return results.length > 0 
                ? `=== Web Search Results ===\n${results.join('\n')}\n\n`
                : 'No relevant web results found.';

        } catch (error) {
            console.error('WebSearch failed:', error);
            return '';
        }
    }
};
