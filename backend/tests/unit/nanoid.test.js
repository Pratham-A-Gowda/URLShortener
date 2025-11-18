const { nanoid } = require('../../utils/nanoid')

describe('Unit Tests: nanoid utility', () => {
  test('should generate a string of specified length', () => {
    const id = nanoid(8)
    expect(id).toHaveLength(8)
  })

  test('should generate unique IDs', () => {
    const id1 = nanoid(8)
    const id2 = nanoid(8)
    expect(id1).not.toBe(id2)
  })

  test('should use only valid characters', () => {
    const id = nanoid(100)
    const validChars = /^[a-z0-9]+$/
    expect(id).toMatch(validChars)
  })

  test('should generate default size 8 when not specified', () => {
    const id = nanoid()
    expect(id).toHaveLength(8)
  })

  test('should generate correct size for various lengths', () => {
    expect(nanoid(5)).toHaveLength(5)
    expect(nanoid(12)).toHaveLength(12)
    expect(nanoid(20)).toHaveLength(20)
  })
})
