import { describe, it, expect } from 'vitest'
import { authHeader } from '../../src/utils/axiosHelper'

describe('Unit Tests: axiosHelper utility', () => {
  it('should return Authorization header when token is provided', () => {
    const token = 'test-token-123'
    const header = authHeader(token)
    
    expect(header).toHaveProperty('Authorization')
    expect(header.Authorization).toBe('Bearer test-token-123')
  })

  it('should return empty object when token is not provided', () => {
    const header = authHeader(null)
    
    expect(header).toEqual({})
  })

  it('should return empty object when token is undefined', () => {
    const header = authHeader(undefined)
    
    expect(header).toEqual({})
  })

  it('should return empty object when token is empty string', () => {
    const header = authHeader('')
    
    expect(header).toEqual({})
  })

  it('should handle tokens with special characters', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlzX2FkbWluIjpmYWxzZX0.test'
    const header = authHeader(token)
    
    expect(header.Authorization).toBe(`Bearer ${token}`)
  })
})
