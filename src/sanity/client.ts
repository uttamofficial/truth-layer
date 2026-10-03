import { createClient } from '@sanity/client';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-01';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});
