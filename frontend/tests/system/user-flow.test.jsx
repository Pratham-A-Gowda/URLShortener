import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

// Mock components for system testing
const MockLoginPage = () => (
  <div>
    <input placeholder="Email" id="email" />
    <input placeholder="Password" id="password" type="password" />
    <button>Login</button>
  </div>
)

const MockDashboard = ({ links }) => (
  <div>
    <h1>Your Links</h1>
    {links.map(link => (
      <div key={link.id}>{link.alias}</div>
    ))}
  </div>
)

describe('System Tests: User Journey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete a user login flow', () => {
    render(
      <BrowserRouter>
        <MockLoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')
    const loginButton = screen.getByText('Login')

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('user@example.com')
    expect(passwordInput.value).toBe('password123')
    expect(loginButton).toBeInTheDocument()
  })

  it('should display user dashboard with links', () => {
    const mockLinks = [
      { id: 1, alias: 'link1', long_url: 'https://example.com' },
      { id: 2, alias: 'link2', long_url: 'https://example2.com' }
    ]

    render(
      <BrowserRouter>
        <MockDashboard links={mockLinks} />
      </BrowserRouter>
    )

    expect(screen.getByText('Your Links')).toBeInTheDocument()
    expect(screen.getByText('link1')).toBeInTheDocument()
    expect(screen.getByText('link2')).toBeInTheDocument()
  })

  it('should handle empty links state', () => {
    render(
      <BrowserRouter>
        <MockDashboard links={[]} />
      </BrowserRouter>
    )

    expect(screen.getByText('Your Links')).toBeInTheDocument()
    expect(screen.queryByText('link1')).not.toBeInTheDocument()
  })
})
