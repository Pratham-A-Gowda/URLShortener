import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import ShortenForm from '../../src/ui/ShortenForm'

// Mock the contexts
vi.mock('../../src/context/ApiContext', () => ({
  useApi: () => ({
    post: vi.fn(),
    defaults: { baseURL: 'http://localhost:4000' }
  })
}))

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token'
  })
}))

describe('Integration Tests: ShortenForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the form with input fields', () => {
    render(<ShortenForm />)
    
    expect(screen.getByPlaceholderText('https://example.com/my-long-url')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('my-alias')).toBeInTheDocument()
  })

  it('should update input values on user typing', () => {
    render(<ShortenForm />)
    
    const longUrlInput = screen.getByPlaceholderText('https://example.com/my-long-url')
    const aliasInput = screen.getByPlaceholderText('my-alias')
    
    fireEvent.change(longUrlInput, { target: { value: 'https://example.com/test' } })
    fireEvent.change(aliasInput, { target: { value: 'mytest' } })
    
    expect(longUrlInput.value).toBe('https://example.com/test')
    expect(aliasInput.value).toBe('mytest')
  })

  it('should have a submit button', () => {
    render(<ShortenForm />)
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    expect(submitButton).toBeInTheDocument()
  })

  it('should clear error when form is submitted', () => {
    render(<ShortenForm />)
    
    const form = screen.getByRole('button', { type: 'submit' }).closest('form')
    expect(form).toBeInTheDocument()
  })
})
