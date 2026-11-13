import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Article bodies are stored as Markdown and rendered on the server.
 * Output is always sanitized, so nothing an editor types can inject scripts.
 */
export function renderMarkdown(md: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens);
    const plain = text.replace(/<[^>]+>/g, "");
    const id = slugify(plain);
    if (depth === 2 || depth === 3) toc.push({ id, text: plain, depth });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  const raw = marked.parse(md, { renderer, async: false, gfm: true }) as string;
  const html = sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "figure", "figcaption"]),
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      th: ["align"],
      td: ["align"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...attribs, rel: "noopener nofollow", target: "_blank" }
            : attribs,
        };
      },
    },
  });
  return { html, toc };
}

export type TocItem = { id: string; text: string; depth: number };

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readingTime(md: string) {
  const words = md.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
