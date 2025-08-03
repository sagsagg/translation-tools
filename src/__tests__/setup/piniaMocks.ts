/**
 * Setup Pinia for testing
 * This file ensures Pinia is properly configured for tests
 */

import { beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Set up Pinia before each test
beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})


