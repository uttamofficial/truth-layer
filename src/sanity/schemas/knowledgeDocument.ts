import { defineField, defineType } from 'sanity';

export const knowledgeDocument = defineType({
  name: 'knowledgeDocument',
  title: 'Knowledge Document',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'API', value: 'API' },
          { title: 'Authentication', value: 'Authentication' },
          { title: 'FAQ', value: 'FAQ' },
          { title: 'Tutorial', value: 'Tutorial' },
          { title: 'Product', value: 'Product' },
          { title: 'Policy', value: 'Policy' },
          { title: 'Developer Guide', value: 'Developer Guide' },
          { title: 'Release Notes', value: 'Release Notes' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      initialValue: 'v1.0.0',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'published',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      return {
        title,
        subtitle: `${subtitle || 'Uncategorized'} • [${status || 'draft'}]`,
      };
    },
  },
});
