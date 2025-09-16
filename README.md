# Newsletter Website

This repository contains a simple static newsletter page that loads the latest issues from a Sanity content dataset and exposes an RSS feed.  It is designed to be hosted on GitHub Pages.

## Structure

The important files and directories in this repository are:

| Path | Purpose |
| --- | --- |
| `docs/newsletter.html` | Static HTML page for the newsletter landing page.  It references `newsletter.css` and `newsletter.js` for styling and dynamic content. |
| `docs/newsletter.css` | Stylesheet used by `newsletter.html`.  Includes the colour palette and layouts. |
| `docs/newsletter.js` | Client‑side script that fetches the latest newsletter entries from Sanity using the public data API and populates the Latest Issue and Archive sections on the page.  Adjust the Sanity configuration constants at the top of this file if you use a different project ID, dataset or API version. |
| `newsletter-schema.js` | Sanity schema definition for the `newsletter` document.  Copy this into your Sanity studio under `schemas/` and import it in your `schema.js` file. |
| `generate-rss.js` | Node script that fetches the most recent newsletters and writes an RSS feed to `docs/newsletter/rss.xml`.  It is run by a GitHub Action on a schedule. |
| `.github/workflows/generate-rss.yml` | Workflow that runs `generate-rss.js` weekly and commits the updated RSS file back to the repository. |
| `docs/newsletter/rss.xml` | The generated RSS feed consumed by mailing services and readers.  It is updated automatically by the workflow. |

## Setting up Sanity Studio

1. If you haven’t already, install the Sanity CLI:

   ```bash
   npm install -g sanity
   ```

2. Initialise a new Studio in a separate folder and select your existing project (e.g. `Paceflow_Newsletter`) and dataset (`production`):

   ```bash
   mkdir studio && cd studio
   sanity init
   ```

3. Copy the provided `newsletter-schema.js` into the `schemas/` directory of your Studio and import it in your schema index (usually `schema.js`).  Restart the Studio (`sanity dev`) and you should see **Newsletter** as a document type.

4. Create new newsletter documents from within the Studio.  Each document should include a `title`, `summary`, `publishDate`, `slug`/`link` and optional `content`.  Publish your documents when ready.

## Static RSS Feed

Because GitHub Pages cannot run serverless functions, the RSS feed is generated statically by `generate-rss.js`.  The GitHub Action defined in `.github/workflows/generate-rss.yml` runs weekly (and can also be triggered manually) to fetch the latest newsletters from Sanity and write `docs/newsletter/rss.xml`.  If there are no changes, the workflow will exit without committing.

If you prefer to generate the RSS feed locally, run:

```bash
node generate-rss.js
```

This script requires Node 18+ which includes the built‑in `fetch` API.

## Deploying to GitHub Pages

1. Commit all files (including those in the `docs` folder) to your repository.

2. In your repository settings on GitHub, navigate to **Pages** and configure GitHub Pages to serve content from the `docs` folder on the `main` branch.

3. Once published, your newsletter page will be available at:

```
https://<your‑username>.github.io/<repo‑name>/newsletter.html
```

…and the RSS feed at:

```
https://<your‑username>.github.io/<repo‑name>/newsletter/rss.xml
```

## Connecting to a Mailing Service

Most email service providers offer an RSS‑to‑email automation feature.  After enabling GitHub Pages, copy the URL of `newsletter/rss.xml` and paste it into your mailing service’s RSS automation configuration.  This will trigger an email to your subscribers each time the feed updates (e.g. whenever a new newsletter document is published in Sanity and the GitHub Action runs).

## Notes

* If your Sanity dataset is private, you will need to set up a read‑only token and include it in the fetch call within both `newsletter.js` and `generate-rss.js`.  Do not expose secret tokens in public repositories; instead use environment variables in your GitHub Action and only embed tokens in server‑side scripts.
* The provided `newsletter.html` file still includes third‑party scripts injected by the original site.  You may choose to remove or sanitise any code that is not required for your newsletter.
* To preview the newsletter page locally, open `docs/newsletter.html` in a browser.  Note that Sanity requests will only work if your dataset allows public access or CORS for `localhost`.
