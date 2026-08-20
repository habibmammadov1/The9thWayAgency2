export type ContentBlock = {
  type: 'paragraph' | 'heading' | 'image' | 'quote';
  value: string;
};

/**
 * Parses an HTML string into structured JSON blocks.
 * Runs safely on client and server environments.
 */
export function htmlToBlocks(html: string): ContentBlock[] {
  if (!html) return [];
  
  // Safe SSR/Client checking
  if (typeof window === "undefined") {
    // Basic regex parser for server side
    const regex = /<(p|h2|h3|blockquote|img)([^>]*?)>(.*?)<\/\1>/gi;
    const imgRegex = /<img[^>]+src="([^">]+)"/gi;
    const blocks: ContentBlock[] = [];
    
    // We can also split by elements using regex loops
    const tags = html.match(/<[^>]+>[^<]*<\/[^>]+>|<img[^>]*>/gi) || [];
    for (const tag of tags) {
      if (/<img/i.test(tag)) {
        const match = /src="([^">]+)"/i.exec(tag);
        if (match && match[1]) {
          blocks.push({ type: 'image', value: match[1] });
        }
      } else if (/<p/i.test(tag)) {
        const match = /<p[^>]*>(.*?)<\/p>/i.exec(tag);
        if (match) blocks.push({ type: 'paragraph', value: match[1] });
      } else if (/<h/i.test(tag)) {
        const match = /<h[2-3][^>]*>(.*?)<\/h[2-3]>/i.exec(tag);
        if (match) blocks.push({ type: 'heading', value: match[1] });
      } else if (/<blockquote/i.test(tag)) {
        const match = /<blockquote[^>]*>(.*?)<\/blockquote>/i.exec(tag);
        if (match) blocks.push({ type: 'quote', value: match[1] });
      }
    }

    if (blocks.length === 0) {
      // Clean tags and wrap in paragraph
      const clean = html.replace(/<\/?[^>]+(>|$)/g, "");
      if (clean.trim()) {
        blocks.push({ type: 'paragraph', value: clean });
      }
    }
    return blocks;
  }

  // Client side parses via DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: ContentBlock[] = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      
      if (tagName === "p") {
        blocks.push({ type: 'paragraph', value: el.innerHTML });
      } else if (tagName === "h2" || tagName === "h3") {
        blocks.push({ type: 'heading', value: el.innerHTML });
      } else if (tagName === "blockquote") {
        blocks.push({ type: 'quote', value: el.innerHTML });
      } else if (tagName === "img") {
        const src = el.getAttribute("src") || "";
        blocks.push({ type: 'image', value: src });
      } else {
        // Fallback for custom wrapper elements inside TipTap output
        const nestedImg = el.querySelector("img");
        if (nestedImg) {
          blocks.push({ type: 'image', value: nestedImg.getAttribute("src") || "" });
        } else if (el.textContent?.trim()) {
          blocks.push({ type: 'paragraph', value: el.innerHTML });
        }
      }
    }
  });

  return blocks;
}

/**
 * Restores structured JSON blocks back into standard HTML string format for TipTap.
 */
export function blocksToHtml(blocks: ContentBlock[]): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block.type === "paragraph") return `<p>${block.value}</p>`;
      if (block.type === "heading") return `<h2>${block.value}</h2>`;
      if (block.type === "quote") return `<blockquote>${block.value}</blockquote>`;
      if (block.type === "image") return `<img src="${block.value}" />`;
      return "";
    })
    .join("");
}
