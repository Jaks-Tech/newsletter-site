/*
 * newsletter.js
 *
 * This script fetches the latest newsletter entries from your Sanity project
 * using the public data API. It populates the "Latest Issue" and
 * "Archive" sections of the newsletter page dynamically.
 */

// Sanity configuration
const SANITY_PROJECT_ID = 'qwsgqgyz';
const DATASET = 'production';
const API_VERSION = '2023-05-03'; // API version for Sanity

// Build the query: fetch the most recent 10 newsletters ordered by publishDate desc
const QUERY = encodeURIComponent('*[_type == "newsletter"] | order(publishDate desc)[0...10]');
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${QUERY}`;

/**
 * Fetch newsletter entries from Sanity.
 * Returns a promise that resolves with an array of newsletter objects.
 */
async function fetchNewsletters() {
  try {
    const response = await fetch(SANITY_URL);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return [];
  }
}

/**
 * Render the latest issue and archive list into the DOM.
 */
function renderNewsletters(newsletters) {
  if (!Array.isArray(newsletters) || newsletters.length === 0) return;

  // Populate the latest issue (first item)
  const latest = newsletters[0];
  const latestContainer = document.getElementById('latest-issue');
  const latestTitle = latest.title || 'Untitled';
  const latestSummary = latest.summary || '';
  const latestLink = latest.link || (latest.slug ? latest.slug.current : '#');
  const latestDate = latest.publishDate ? new Date(latest.publishDate).toLocaleDateString() : '';
  latestContainer.innerHTML = `
    <h3><a href="${latestLink}">${latestTitle}</a></h3>
    <small>${latestDate}</small>
    <p>${latestSummary}</p>
    <a href="${latestLink}">Read more →</a>
  `;

  // Populate the archive list with the remaining items
  const archiveList = document.getElementById('archive-list');
  archiveList.innerHTML = '';
  newsletters.slice(1).forEach(item => {
    const link = item.link || (item.slug ? item.slug.current : '#');
    const date = item.publishDate ? new Date(item.publishDate).toLocaleDateString() : '';
    const li = document.createElement('li');
    li.innerHTML = `<a href="${link}">${item.title}</a><span class="date">${date}</span>`;
    archiveList.appendChild(li);
  });
}

// When the DOM is loaded, fetch and render the newsletters
document.addEventListener('DOMContentLoaded', () => {
  fetchNewsletters().then(renderNewsletters);
});