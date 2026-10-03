import { defineField, defineType } from 'sanity';

export const review = defineType({
  name: 'review',
  title: 'Review Workflow',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'conflict',
      title: 'Conflict',
      type: 'reference',
      to: [{ type: 'contentConflict' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewer',
      title: 'Reviewer',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'comment',
      title: 'Comment / Recommendation',
      type: 'text',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'resolvedAt',
      title: 'Resolved At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      reviewer: 'reviewer',
      status: 'status',
    },
    prepare({ title, reviewer, status }) {
      return {
        title,
        subtitle: `By ${reviewer || 'Unassigned'} • [${status || 'pending'}]`,
      };
    },
  },
});
