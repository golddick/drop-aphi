

export const parseMarkdown = (text: string): string => {
  // First process code blocks to prevent them from being modified by other rules
  let processedText = text;
  const codeBlocks: string[] = [];
  
  // Store code blocks temporarily
  processedText = processedText.replace(
    /```[\s\S]*?```/g,
    (match) => {
      codeBlocks.push(match);
      return '%%CODEBLOCK%%';
    }
  );

  // Process headers
  processedText = processedText
    .replace(
      /^### (.*$)/gm,
      '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900 border-l-4 border-gold-500 pl-4">$1</h3>'
    )
    .replace(
      /^## (.*$)/gm,
      '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900 border-l-4 border-gold-600 pl-4 bg-gold-50 py-2 rounded-r-lg">$1</h2>'
    )
    .replace(
      /^# (.*$)/gm,
      '<h1 class="text-2xl font-bold mt-10 mb-6 text-gray-900 border-l-6 border-black-600 pl-6 bg-gradient-to-r from-gold-50 to-transparent py-3 rounded-r-lg">$1</h1>'
    );

  // Process blockquotes (must handle multi-line quotes)
  processedText = processedText.replace(
    /^> (.*(?:\n> .*)*)/gm,
    (match) => {
      const content = match.replace(/^> /gm, ''); // Remove all > markers
      return `<blockquote class="border-l-4 border-gold-600 pl-6 py-2 my-4 bg-gold-50 italic text-gray-700 rounded-r-lg">${content}</blockquote>`;
    }
  );

  // Process lists (unordered and ordered)
  processedText = processedText.replace(
    /^(\*|\-|\d+\.) (.*$)/gm,
    (match, bullet, content) => {
      if (bullet === '*' || bullet === '-') {
        return `<li class="ml-4 mb-2 text-gray-700 list-disc">${content}</li>`;
      } else {
        return `<li class="ml-4 mb-2 text-gray-700 list-decimal">${content}</li>`;
      }
    }
  );

  // Process bold and italic
  processedText = processedText
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em class="font-bold italic text-gray-900">$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic text-gray-700">$1</em>');

  // Process code blocks and inline code
  processedText = processedText
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700"><code class="language-$1">$2</code></pre>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 text-gray-800 px-2 py-2 rounded text-sm font-mono border">$1</code>'
    );


// Process links with new tab opening for external URLs
   processedText = processedText.replace(
  /\[([^\]]+)\]\(([^)]+)\)/g,
  (match, text, url) => {
    const isExternal = /^(https?:\/\/|www\.)/i.test(url);
    const finalUrl = url.startsWith('www.') ? `https://${url}` : url;

    const attrs = isExternal
      ? 'target="_blank" rel="noopener noreferrer"'
      : '';

    return `<a href="${finalUrl}" class="text-gold-600 hover:text-gold-800 underline font-medium" ${attrs}>${text}</a>`;
  }
);


  // Process images
  processedText = processedText.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="my-4 rounded-lg mx-auto max-w-full h-auto" />'
  );

  // Process horizontal rule
  processedText = processedText.replace(
    /^\*\*\*$/gm,
    '<hr class="my-6 border-t border-gray-200" />'
  );

  // Process paragraphs and line breaks
  processedText = processedText
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
    .replace(/^(?!<[a-z])([^<].*)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>');

  // Clean up empty paragraphs
  processedText = processedText.replace(/<p class="mb-4 text-gray-700 leading-relaxed"><\/p>/g, '');

  // Restore code blocks
  processedText = processedText.replace(
    /%%CODEBLOCK%%/g,
    () => codeBlocks.shift() || ''
  );

  return processedText;
};


