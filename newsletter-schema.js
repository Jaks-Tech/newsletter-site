/**
 * Sanity schema definition for the Paceflow Newsletter.
 *
 * Save this file in your Sanity studio under `./schemas/` and import it
 * into your schema index file (usually `schema.js` or `schema.ts`) so
 * that Sanity knows about the newsletter document type. Once added, you
 * can create and manage newsletter entries via the Sanity Studio UI.
 */

export default {
  name: 'newsletter',
  title: 'Newsletter',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'A short description or teaser for the newsletter issue.'
    },
    {
      name: 'publishDate',
      title: 'Publish Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required()
    },
    {
      name: 'link',
      title: 'External Link',
      type: 'url',
      description: 'Optional link to an external PDF or blog post. Leave blank to use an internal slug-based URL.'
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Full content of the newsletter issue.'
    }
  ]
};