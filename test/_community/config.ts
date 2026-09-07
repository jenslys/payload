import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { fileURLToPath } from 'node:url'
import path from 'path'
import type { Block, CollectionConfig } from 'payload'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { devUser } from '../credentials.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const relationshipBlock: Block = {
  slug: 'relationshipBlock',
  fields: [
    {
      name: 'relatedItem',
      type: 'relationship',
      relationTo: 'hidden-items',
      required: true,
    },
  ],
}

const HiddenItems: CollectionConfig = {
  slug: 'hidden-items',
  admin: {
    hidden: ({ user }) => Boolean(user),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}

const ReproductionPosts: CollectionConfig = {
  slug: 'reproduction-posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks: [relationshipBlock] }),
        ],
      }),
    },
  ],
}

export default buildConfigWithDefaults({
  collections: [ReproductionPosts, HiddenItems],
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  onInit: async (payload) => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    })

    const relatedItem = await payload.create({
      collection: 'hidden-items',
      data: {
        title: 'Existing relationship target',
      },
    })

    await payload.create({
      collection: 'reproduction-posts',
      data: {
        title: 'Saving this post fails',
        content: {
          root: {
            children: [
              {
                type: 'block',
                version: 2,
                format: '',
                fields: {
                  blockName: 'Relationship block',
                  blockType: relationshipBlock.slug,
                  relatedItem: relatedItem.id,
                },
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
      },
    })
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
