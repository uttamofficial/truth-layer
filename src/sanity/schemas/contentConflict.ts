import { defineField, defineType } from 'sanity';

export const contentConflict = defineType({
  name: 'contentConflict',
  title: 'Content Conflict',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceDocumentA',
      title: 'Source Document A',
      type: 'reference',
      to: [{ type: 'knowledgeDocument' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceDocumentB',
      title: 'Source Document B',
      type: 'reference',
      to: [{ type: 'knowledgeDocument' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'conflictType',
      title: 'Conflict Type',
      type: 'string',
      options: {
        list: [
          { title: 'Contradictory', value: 'contradictory' },
          { title: 'Outdated', value: 'outdated' },
          { title: 'Ambiguous', value: 'ambiguous' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'aiAnalysis',
      title: 'AI Analysis',
      type: 'text',
      description: 'Detailed analysis of why these documents conflict',
    }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
        ],
      },
      initialValue: 'medium',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Detected', value: 'detected' },
          { title: 'In Review', value: 'review' },
          { title: 'Resolved', value: 'resolved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'detected',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'conflictType',
      severity: 'severity',
      status: 'status',
    },
    prepare({ title, type, severity, status }) {
      return {
        title,
        subtitle: `${type || 'conflict'} • Sev: ${severity || 'med'} • [${status || 'detected'}]`,
      };
    },
  },
});
