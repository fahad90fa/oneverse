import DOMPurify from "dompurify";

export const sanitizationService = {
  sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "em",
        "strong",
        "a",
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      ALLOWED_ATTR: ["href", "title", "target"],
      KEEP_CONTENT: true,
    });
  },

  sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  },

  sanitizeUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        return null;
      }
      return urlObj.toString();
    } catch {
      return null;
    }
  },

  sanitizeInput(input: string, maxLength: number = 1000): string {
    return DOMPurify.sanitize(input.substring(0, maxLength), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }).trim();
  },

  escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  stripScripts(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    const scripts = div.querySelectorAll("script, iframe, object, embed");
    scripts.forEach((script) => script.remove());
    return div.innerHTML;
  },

  removeXssPayloads(input: string): string {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
    ];

    let cleaned = input;
    xssPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "");
    });

    return cleaned;
  },
};
