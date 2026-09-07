import type { Payload } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { NextRESTClient } from '../__helpers/shared/NextRESTClient.js'

import { initPayloadInt } from '../__helpers/shared/initPayloadInt.js'
import { devUser } from '../credentials.js'

let payload: Payload
let restClient: NextRESTClient

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

describe('function-based admin.hidden with a Lexical block relationship', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt(dirname)
    ;({ payload, restClient } = initialized)

    await restClient.login({
      slug: 'users',
      credentials: {
        email: devUser.email,
        password: devUser.password,
      },
    })
  })

  afterAll(async () => {
    await payload.destroy()
  })

  it('allows a readable existing relationship to remain selected when saving', async () => {
    const hiddenItemsResponse = await restClient.GET('/hidden-items')
    expect(hiddenItemsResponse.status).toBe(200)

    const postsResponse = await restClient.GET('/reproduction-posts', {
      query: {
        depth: 0,
        limit: 1,
      },
    })
    const { docs } = await postsResponse.json()
    const post = docs[0]

    const updateResponse = await restClient.PATCH(`/reproduction-posts/${post.id}`, {
      body: JSON.stringify({
        title: post.title,
        content: post.content,
      }),
    })
    const updateResult = await updateResponse.json()

    expect(updateResponse.status).toBe(200)
    expect(updateResult).toHaveProperty('doc')
  })
})
