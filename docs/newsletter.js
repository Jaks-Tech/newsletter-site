/*
 * newsletter.js
 *
 * Dynamically fetches and renders the latest Paceflow newsletter issues from
 * Sanity. The script queries the Sanity API for the most recent entries
 * and populates the Latest Issue and Archive sections of the newsletter
 * page.  It gracefully handles missing content by showing fallback text.
 *
 * NOTE: This script assumes that your Sanity dataset is configured to be
 * publicly readable (or CORS enabled for your domain). If your dataset is
 * private, you will need to generate a read-only token and add an
 * Authorization header to the fetch call below. Do not expose secret
 * tokens in client-side code for production environments.
 */

(function () {
  // Configuration constants. Replace these values with your Sanity project
  // information. The API version should be a date string (YYYY-MM-DD)
  // corresponding to a stable Sanity API date.
  const PROJECT_ID = 'qwsgqgyz';
  const DATASET = 'production';
  const API_VERSION = 'v2025-01-01';

  // GROQ query to fetch up to 10 most recent newsletter entries. Adjust
  // the fields in the selection to match your newsletter schema.
  const QUERY = encodeURIComponent(`*[_type == "newsletter"] | order(publishDate desc)[0...10]{
    _id,
    title,
    summary,
    publishDate,
    "slug": slug.current,
    link
  }`);

  /**
   * Fetch the latest newsletters from Sanity.
   *
   * @returns {Promise<Array>} Array of newsletter objects or an empty array
   */
  async function fetchNewsletters() {
    const url = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${QUERY}`;
    try {
      const res = await fetch(url, {
        // Do not send credentials; the dataset must be public or CORS-configured.
        credentials: 'omit'
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch newsletters: ${res.status}`);
      }
      const data = await res.json();
      return data.result || [];
    } catch (err) {
      console.error('Error fetching newsletters:', err);
      return [];
    }
  }

  /**
   * Format a date string into a human-friendly format.
   *
   * @param {string} dateString ISO date string
   * @returns {string} Formatted date, e.g., "Sep 3, 2025"
   */
  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Render the latest newsletter issue into the page. If there are no issues
   * available, a fallback message is displayed.
   *
   * @param {Object|undefined} issue The most recent newsletter entry
   */
  function renderLatest(issue) {
    const container = document.getElementById('latest-issue-container');
    if (!container) return;
    if (!issue) {
      // Display a friendly message when no issues are available yet.
      container.innerHTML = `
        <div class="card">
          <h3>Coming Soon</h3>
          <p class="muted">Stay tuned for our next newsletter issue.</p>
        </div>
      `;
      return;
    }
    // Use the external link if provided; otherwise generate a relative slug link.
    const url = issue.link || `/newsletter/${issue.slug || issue._id}`;
    container.innerHTML = `
      <div class="card">
        <h3>${issue.title || 'Untitled'}</h3>
        <p class="muted">${formatDate(issue.publishDate)}</p>
        ${issue.summary ? `<p>${issue.summary}</p>` : ''}
        <a href="${url}" class="btn" style="margin-top: 16px;">Read more</a>
      </div>
    `;
  }

  /**
   * Render the archive list of older newsletter issues.
   *
   * @param {Array} issues Remaining newsletter entries after the latest
   */
  function renderArchive(issues) {
    const container = document.getElementById('archive-container');
    if (!container) return;
    if (!issues || issues.length === 0) {
      container.innerHTML = '<p class="muted">No past issues yet.</p>';
      return;
    }
    const items = issues.map(issue => {
      const url = issue.link || `/newsletter/${issue.slug || issue._id}`;
      const date = formatDate(issue.publishDate);
      return `
        <div class="archive-item">
          <a href="${url}">${issue.title || 'Untitled'}</a>
          <span class="muted">${date}</span>
        </div>
      `;
    });
    container.innerHTML = items.join('');
  }

  /**
   * Initialize the dynamic newsletter page by fetching data and populating
   * the latest issue and archive containers.
   */
  async function init() {
    const issues = await fetchNewsletters();
    const [latest, ...archive] = issues;
    renderLatest(latest);
    renderArchive(archive);
  }

  // Kick off the script once the DOM is fully loaded.  Without this,
  // containers may not yet exist when the script runs.
  document.addEventListener('DOMContentLoaded', init);
})();