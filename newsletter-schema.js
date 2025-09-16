/**
 * Sanity schema definition for the Newsletter document type.
 *
 * Copy this file into your Sanity studio under the `schemas/` directory
 * and import it into your schema index (e.g. `schema.js`).
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
