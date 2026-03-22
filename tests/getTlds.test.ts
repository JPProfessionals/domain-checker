import { describe, it, expect, vi } from 'vitest'
import getTldsHandler from '../server/api/getTlds.post'
import { readBody } from 'h3'

vi.mock('h3', () => ({
  defineEventHandler: (handler: any) => handler,
  readBody: vi.fn()
}))

describe('getTlds.post.ts Handler', () => {
  it('returns default TLDs with correct format', async () => {
    // @ts-ignore
    readBody.mockResolvedValueOnce({ pageSize: 5 })
    
    // getTldsHandler is the unwrapped function because of our mock
    const res = await (getTldsHandler as any)({} as any)
    
    expect(res).toBeInstanceOf(Array)
    expect(res.length).toBe(5)
    expect(res[0]).toMatch(/^\.[a-z0-9-]+$/)
  })

  it('filters by type correctly', async () => {
    // @ts-ignore
    readBody.mockResolvedValueOnce({ type: 'COUNTRY_CODE', pageSize: 1 })
    
    const res = await (getTldsHandler as any)({} as any)
    expect(res.length).toBe(1)
  })

  it('filters by search input correctly', async () => {
    // @ts-ignore
    readBody.mockResolvedValueOnce({ input: 'com' })
    
    const res = await (getTldsHandler as any)({} as any)
    expect(res.some((t: string) => t.includes('com'))).toBe(true)
  })

  it('handles negative or excessive page sizes', async () => {
    // @ts-ignore
    readBody.mockResolvedValueOnce({ pageSize: -1 })
    const res1 = await (getTldsHandler as any)({} as any)
    expect(res1.length).toBeGreaterThan(100)

    // @ts-ignore
    readBody.mockResolvedValueOnce({ pageSize: 999999 })
    const res2 = await (getTldsHandler as any)({} as any)
    expect(res2.length).toBeGreaterThan(100)
  })

  it('handles invalid filter types', async () => {
    // @ts-ignore
    readBody.mockResolvedValueOnce({ type: 'INVALID' })
    const res = await (getTldsHandler as any)({} as any)
    expect(res.length).toBeGreaterThan(100)
  })

  it('handles undefined body without throwing', async () => {
    // @ts-ignore
    readBody.mockResolvedValueOnce(undefined)
    const res = await (getTldsHandler as any)({} as any)
    expect(res.length).toBeGreaterThan(10)
  })
})
