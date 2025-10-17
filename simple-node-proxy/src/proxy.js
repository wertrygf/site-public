import fetch from 'node-fetch';
import { rewriteHtml } from './utils.js';
import { URL } from 'url';

const cache = new Map();

export async function proxyHandler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  if (cache.has(targetUrl)) {
    console.log('Serving from cache');
    return res.send(cache.get(targetUrl));
  }

  const options = {
    method: req.method,
    headers: req.headers,
    body: req.method === 'POST' ? req.body : null,
  };

  try {
    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type') || '';

    let responseBody = '';
    if (contentType.includes('text/html')) {
      responseBody = await response.text();
      const rewritten = rewriteHtml(responseBody, targetUrl);
      cache.set(targetUrl, rewritten); // キャッシュに保存
      res.setHeader('Content-Type', 'text/html');
      res.send(rewritten);
    } else {
      responseBody = await response.text();
      cache.set(targetUrl, responseBody); // 他のレスポンスもキャッシュ
      res.setHeader('Content-Type', contentType);
      res.send(responseBody);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching the target URL.');
  }
}
