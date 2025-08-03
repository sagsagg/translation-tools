import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Convert Translation')
    expect(wrapper.text()).toContain('Add Translation Data')
    expect(wrapper.text()).toContain('Language Configuration')
  })
})
