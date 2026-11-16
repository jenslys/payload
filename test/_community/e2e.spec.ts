import type { BrowserContext, Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { ensureCompilationIsDone, initPageConsoleErrorCatch } from '../__helpers/e2e/helpers.js'
import { AdminUrlUtil } from '../__helpers/shared/adminUrlUtil.js'
import { initPayloadE2ENoConfig } from '../__helpers/shared/initPayloadE2ENoConfig.js'
import { TEST_TIMEOUT_LONG } from '../playwright.config.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

test.describe('Stale list sort after a field becomes virtual', () => {
  let context: BrowserContext | undefined
  let page: Page
  let url: AdminUrlUtil

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(TEST_TIMEOUT_LONG)

    const { serverURL } = await initPayloadE2ENoConfig({ dirname })
    url = new AdminUrlUtil(serverURL, 'posts')

    context = await browser.newContext()
    page = await context.newPage()
    initPageConsoleErrorCatch(page)
    await ensureCompilationIsDone({ page, serverURL })
  })

  test.beforeEach(async () => {
    const response = await page.request.post(
      `${url.serverURL}/api/payload-preferences/collection-posts`,
      {
        data: { value: { sort: '-computedValue' } },
      },
    )

    expect(response.status()).toBe(200)
  })

  test.afterEach(async () => {
    const response = await page.request.delete(
      `${url.serverURL}/api/payload-preferences/collection-posts`,
    )

    expect(response.status()).toBe(200)
  })

  test.afterAll(async () => {
    await context?.close()
  })

  test('should recover when an explicit valid sort replaces the stale preference', async () => {
    await page.goto(`${url.list}?sort=title`)

    await expect(page.getByRole('link', { name: 'example post', exact: true })).toBeVisible()
  })

  test('should keep the collection usable when the saved sort references a now-virtual field', async () => {
    await page.goto(url.list)

    await expect(page.getByRole('link', { name: 'example post', exact: true })).toBeVisible()
  })
})
