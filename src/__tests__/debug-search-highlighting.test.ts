import { describe, it, expect } from 'vitest'
import { highlightText } from '@/utils'

describe('Debug Search Highlighting', () => {
  describe('highlightText utility function', () => {
    it('should highlight text correctly', () => {
      const result = highlightText('Welcome to our application', 'welcome')
      expect(result).toBe('<mark>Welcome</mark> to our application')
    })

    it('should highlight multiple occurrences', () => {
      const result = highlightText('Login to login page', 'login')
      expect(result).toBe('<mark>Login</mark> to <mark>login</mark> page')
    })

    it('should be case insensitive', () => {
      const result = highlightText('Password field', 'PASSWORD')
      expect(result).toBe('<mark>Password</mark> field')
    })

    it('should handle special characters', () => {
      const result = highlightText('app.login.title', 'login')
      expect(result).toBe('app.<mark>login</mark>.title')
    })

    it('should return original text when no match', () => {
      const result = highlightText('Welcome message', 'xyz')
      expect(result).toBe('Welcome message')
    })

    it('should return original text when query is empty', () => {
      const result = highlightText('Welcome message', '')
      expect(result).toBe('Welcome message')
    })
  })

  describe('Search scenarios', () => {
    it('should highlight keys containing search term', () => {
      const key = 'app.login.title'
      const result = highlightText(key, 'login')
      expect(result).toBe('app.<mark>login</mark>.title')
    })

    it('should highlight values containing search term', () => {
      const value = 'Welcome to our application'
      const result = highlightText(value, 'welcome')
      expect(result).toBe('<mark>Welcome</mark> to our application')
    })

    it('should highlight partial matches in values', () => {
      const value = 'Submit Form'
      const result = highlightText(value, 'submit')
      expect(result).toBe('<mark>Submit</mark> Form')
    })

    it('should highlight Chinese text', () => {
      const value = '欢迎使用我们的应用程序'
      const result = highlightText(value, '欢迎')
      expect(result).toBe('<mark>欢迎</mark>使用我们的应用程序')
    })
  })
})
