import { describe, it, expect, vi } from 'vitest'
import getTldsHandler from '../server/api/getTlds.post'
import { readBody } from 'h3'

vi.mock('h3', () => ({
  defineEventHandler: (handler: unknown) => handler,
  readBody: vi.fn()
}))

// getTldsHandler is the unwrapped function because of our defineEventHandler mock
type TestHandler = (event: Record<string, unknown>) => Promise<unknown>
const handler = getTldsHandler as TestHandler

describe('getTlds.post.ts Handler', () => {
  it('returns default TLDs with correct format', async () => {
    // @ts-expect-error readBody is mocked
    readBody.mockResolvedValueOnce({ pageSize: 5 })
    
    const res = await handler({}) as string[]
    
    expect(res).toBeInstanceOf(Array)
    expect(res.length).toBe(5)
    expect(res[0]).toMatch(/^\.[a-z0-9-]+$/)
  })

  it('filters by type correctly', async () => {
    // @ts-expect-error readBody is mocked
    readBody.mockResolvedValueOnce({ type: 'COUNTRY_CODE', pageSize: 1 })
    
    const res = await handler({}) as string[]
    expect(res.length).toBe(1)
  })

  it('filters by search input correctly', async () => {
    // @ts-expect-error readBody is mocked
    readBody.mockResolvedValueOnce({ input: 'com' })
    
    const res = await handler({}) as string[]
    expect(res.some((t: string) => t.includes('com'))).toBe(true)
  })

  it('handles negative or excessive page sizes', async () => {
    // @ts-expect-error readBody is mocked
    readBody.mockResolvedValueOnce({ pageSize: -1 })
    const res1 = await handler({}) as string[]
    expect(res1.length).toBeGreaterThan(100)

    // @ts-expect-error readBody is mocked
    readBody.mockResolvedValueOnce({ pageSize: 999999 })
    const res2 = await handler({}) as string[]
    expect(res2.length).toBeGreaterThan(100)
  })

  it('handles invalid filter types', async () => {
    // @ts-expect-error readBody is mocked
    readBody.mockResolvedValueOnce({ type: 'INVALID' })
    const res = await handler({}) as string[]
    expect(res.length).toBeGreaterThan(100)
  })

  it('handles undefined body without throwing', async () => {
    // @ts-expect-error readBody is mocked
    readBody.mockResolvedValueOnce(undefined)
    const res = await handler({}) as string[]
    expect(res.length).toBeGreaterThan(10)
  })
})
