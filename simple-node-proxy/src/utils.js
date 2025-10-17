import cheerio from 'cheerio';
import { URL } from 'url';

export function rewriteHtml(html, baseUrl) {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);

  const rewriteAttr = (selector, attr) => {
    $(selector).each((_, el) => {
      const orig = $(el).attr(attr);
      if (orig && !orig.startsWith('data:') && !orig.startsWith('javascript:')) {
        try {
          const absUrl = new URL(orig, base).toString();
          $(el).attr(attr, `/proxy?url=${encodeURIComponent(absUrl)}`);
        } catch (e) {
          // 無効なURLは無視
        }
      }
    });
  };

  rewriteAttr('a', 'href');
  rewriteAttr('img', 'src');
  rewriteAttr('script', 'src');
  rewriteAttr('link', 'href');
  rewriteAttr('iframe', 'src');

  return $.html();
}
