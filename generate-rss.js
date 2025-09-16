/*
 * generate-rss.js
 *
 * This Node script fetches newsletter entries from your Sanity project and
 * writes an RSS feed (rss.xml) into the docs/newsletter directory. It is
 * intended to be run locally or from a GitHub Action. The script uses
 * Node's built-in fetch (available in Node 18+) to request data from Sanity's
 * data API.
 */

const fs = require('fs');

// Sanity configuration
const SANITY_PROJECT_ID = 'qwsgqgyz';
const DATASET = 'production';
const API_VERSION = '2023-05-03';

// GROQ query to fetch up to 100 newsletters, newest first
const QUERY = encodeURIComponent('*[_type == "newsletter"] | order(publishDate desc)[0...100]');
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${QUERY}`;

/**
 * Convert newsletter objects into RSS items.
 *
 * @param {Array} items Array of newsletter documents from Sanity.
 * @returns {string} RSS items XML
 */
function buildRssItems(items) {
  return items.map(item => {
    const title = item.title || 'Untitled';
    const link = item.link || (item.slug ? item.slug.current : '#');
    const description = item.summary || '';
    const pubDate = item.publishDate ? new Date(item.publishDate).toUTCString() : new Date().toUTCString();
    return `    <item>\n      <title><![CDATA[${title}]]></title>\n      <link>${link}</link>\n      <description><![CDATA[${description}]]></description>\n      <pubDate>${pubDate}</pubDate>\n    </item>`;
  }).join('\n');
}

/**
 * Fetch newsletter data from Sanity and generate RSS XML.
 */
async function generateRss() {
  try {
    const res = await fetch(SANITY_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch from Sanity: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const items = data.result || [];
    const rssItems = buildRssItems(items);
    const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Newsletter Feed</title>\n    <link>https://your-username.github.io/newsletter-site/newsletter.html</link>\n    <description>Latest newsletters from our site</description>\n${rssItems}\n  </channel>\n</rss>`;
    // Ensure the output directory exists
    fs.mkdirSync('docs/newsletter', { recursive: true });
    fs.writeFileSync('docs/newsletter/rss.xml', rss, 'utf8');
    console.log('RSS feed generated successfully.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

generateRss();
