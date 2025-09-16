/**
 * API Route: /api/newsletter-rss
 *
 * Generates an RSS feed of the most recent Paceflow newsletter entries by
 * querying Sanity's content API. This route is designed to run on
 * serverless platforms such as Vercel. When new newsletters are
 * published in Sanity, this feed will be automatically updated and can
 * be consumed by email services that support RSS-to-email workflows.
 *
 * Environment variables (recommended):
 *   SANITY_PROJECT_ID  – Your Sanity project ID (e.g. qwsgqgyz)
 *   SANITY_DATASET     – The dataset to query (e.g. production)
 *   SANITY_API_VERSION – API version date (e.g. 2025-01-01)
 *   SANITY_TOKEN       – Optional read-only token for private datasets
 *   SITE_URL           – Base URL of your site (e.g. https://paceflow.io)
 */

export default async function handler(req, res) {
  const projectId = process.env.SANITY_PROJECT_ID || 'qwsgqgyz';
  const dataset = process.env.SANITY_DATASET || 'production';
  const apiVersion = process.env.SANITY_API_VERSION || 'v2025-01-01';
  const token = process.env.SANITY_TOKEN;
  const siteUrl = process.env.SITE_URL || 'https://paceflow.io';

  // Query up to the 20 most recent newsletter entries. Adjust the number
  // or fields as needed. We include slug and link to build URLs.
  const query = encodeURIComponent(`*[_type == "newsletter"] | order(publishDate desc)[0...20]{
    _id,
    title,
    summary,
    publishDate,
    "slug": slug.current,
    link
  }`);

  const url = `https://${projectId}.api.sanity.io/${apiVersion}/data/query/${dataset}?query=${query}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status}`);
    }
    const data = await response.json();
    const items = data.result || [];

    // Build each RSS item. Ensure all text is properly escaped for XML.
    const rssItems = items.map(item => {
      const pubDate = new Date(item.publishDate || Date.now()).toUTCString();
      const title = item.title ? escapeCdata(item.title) : 'Untitled';
      const summary = item.summary ? escapeCdata(item.summary) : '';
      // Use external link if provided; otherwise generate internal slug URL.
      const link = item.link && /^https?:\/\//.test(item.link)
        ? item.link
        : `${siteUrl}/newsletter/${item.slug || item._id}`;
      return `\n      <item>\n        <title><![CDATA[${title}]]></title>\n        <link>${link}</link>\n        <guid isPermaLink="false">${item._id}</guid>\n        <pubDate>${pubDate}</pubDate>\n        <description><![CDATA[${summary}]]></description>\n      </item>`;
    }).join('');

    // Compose the RSS feed XML. Include channel metadata as needed.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Paceflow Newsletter</title>\n    <link>${siteUrl}/newsletter</link>\n    <description>Latest newsletters and product updates from Paceflow</description>${rssItems}\n  </channel>\n</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Error generating RSS feed:', err);
    return res.status(500).send('Error generating RSS feed');
  }

  // Helper function to escape CDATA delimiters inside content. Ensures
  // that nested CDATA sections do not prematurely close.  We replace
  // occurrences of "]]>" with a safe sequence.
  function escapeCdata(str) {
    return String(str).replace(/]]>/g, ']]]]><![CDATA[>');
  }
}