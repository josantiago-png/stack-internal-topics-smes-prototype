/**
 * Escapes HTML entities and wraps known @mention names in a blue span.
 * @param {string} text
 * @param {string[]} names - exact mention names to highlight (e.g. ["Stack Internal"])
 * @returns {string} HTML string
 */
export function highlightMentions(text, names = []) {
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	if (!names.length) return escaped;

	// Sort longest first so "Stack Internal" matches before "Stack"
	const sorted = [...names].sort((a, b) => b.length - a.length);
	const pattern = sorted
		.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('|');
	const regex = new RegExp(`@(${pattern})`, 'gi');

	return escaped.replace(regex, (match) => `<span class="mention">${match}</span>`);
}
