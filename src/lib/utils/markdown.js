/**
 * Renders a subset of Slack mrkdwn + standard markdown to safe HTML.
 * Supports: bold, italic, strikethrough, inline code, code blocks, bullet lists, numbered lists, blockquotes.
 * @param {string} text
 * @returns {string}
 */
export function renderMarkdown(text) {
	if (!text) return '';

	// Escape HTML entities to prevent XSS
	function escape(str) {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	// Inline formatting: applied after HTML escaping
	function inline(str) {
		let s = escape(str);
		// Inline code (do first to protect contents)
		s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
		// Bold: **text** or *text* (Slack uses single *)
		s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		s = s.replace(/\*([^*\s][^*]*?[^*\s]|\S)\*/g, '<strong>$1</strong>');
		// Italic: _text_
		s = s.replace(/_([^_\s][^_]*?[^_\s]|\S)_/g, '<em>$1</em>');
		// Strikethrough: ~text~
		s = s.replace(/~([^~]+)~/g, '<s>$1</s>');
		return s;
	}

	const lines = text.split('\n');
	const out = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Fenced code block
		if (line.startsWith('```')) {
			const codeLines = [];
			i++;
			while (i < lines.length && !lines[i].startsWith('```')) {
				codeLines.push(escape(lines[i]));
				i++;
			}
			out.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
			i++;
			continue;
		}

		// Blockquote
		if (line.startsWith('> ')) {
			out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
			i++;
			continue;
		}

		// Bullet list — collect consecutive items
		if (/^[-*•] /.test(line)) {
			const items = [];
			while (i < lines.length && /^[-*•] /.test(lines[i])) {
				items.push(`<li>${inline(lines[i].replace(/^[-*•] /, ''))}</li>`);
				i++;
			}
			out.push(`<ul>${items.join('')}</ul>`);
			continue;
		}

		// Numbered list — collect consecutive items
		if (/^\d+\. /.test(line)) {
			const items = [];
			while (i < lines.length && /^\d+\. /.test(lines[i])) {
				items.push(`<li>${inline(lines[i].replace(/^\d+\. /, ''))}</li>`);
				i++;
			}
			out.push(`<ol>${items.join('')}</ol>`);
			continue;
		}

		// Blank line — skip (spacing handled by CSS gap)
		if (line.trim() === '') {
			i++;
			continue;
		}

		// Regular line
		out.push(`<p>${inline(line)}</p>`);
		i++;
	}

	return out.join('');
}
