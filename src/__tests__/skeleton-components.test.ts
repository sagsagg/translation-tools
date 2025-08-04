import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUploaderSkeleton from '@/components/skeleton/FileUploaderSkeleton.vue'
import TextInputSkeleton from '@/components/skeleton/TextInputSkeleton.vue'

describe('Skeleton Components', () => {
  describe('FileUploaderSkeleton', () => {
    it('should render with proper accessibility attributes', () => {
      const wrapper = mount(FileUploaderSkeleton)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Loading file uploader"]').exists()).toBe(true)
      expect(wrapper.find('.sr-only').text()).toContain('Loading file upload interface')
    })

    it('should have proper skeleton structure', () => {
      const wrapper = mount(FileUploaderSkeleton)
      
      // Check main upload area
      expect(wrapper.find('.border-dashed').exists()).toBe(true)
      expect(wrapper.find('.border-slate-300').exists()).toBe(true)
      
      // Check animated elements
      expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
      
      // Check skeleton elements
      expect(wrapper.find('.h-12.w-12').exists()).toBe(true) // Icon skeleton
      expect(wrapper.findAll('.h-6').length).toBeGreaterThan(0) // Badge skeletons
      expect(wrapper.findAll('.h-4').length).toBeGreaterThan(0) // Text skeletons
    })

    it('should use Slate color scheme', () => {
      const wrapper = mount(FileUploaderSkeleton)
      
      // Check for slate colors in classes
      expect(wrapper.html()).toContain('slate-200')
      expect(wrapper.html()).toContain('slate-700')
      expect(wrapper.html()).toContain('slate-300')
      expect(wrapper.html()).toContain('slate-600')
    })

    it('should be responsive', () => {
      const wrapper = mount(FileUploaderSkeleton)
      
      // Check for responsive classes
      expect(wrapper.find('.w-full').exists()).toBe(true)
      expect(wrapper.find('.mx-auto').exists()).toBe(true)
    })
  })

  describe('TextInputSkeleton', () => {
    it('should render with proper accessibility attributes', () => {
      const wrapper = mount(TextInputSkeleton)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Loading text input interface"]').exists()).toBe(true)
      expect(wrapper.find('.sr-only').text()).toContain('Loading text input interface')
    })

    it('should have proper skeleton structure', () => {
      const wrapper = mount(TextInputSkeleton)
      
      // Check format selection area
      expect(wrapper.findAll('.rounded-full').length).toBeGreaterThan(0) // Radio buttons
      
      // Check textarea skeleton
      expect(wrapper.find('.min-h-\\[200px\\]').exists()).toBe(true)
      
      // Check animated elements
      expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
      
      // Check button skeleton
      expect(wrapper.find('.h-10').exists()).toBe(true) // Process button
    })

    it('should use Slate color scheme', () => {
      const wrapper = mount(TextInputSkeleton)
      
      // Check for slate colors in classes
      expect(wrapper.html()).toContain('slate-200')
      expect(wrapper.html()).toContain('slate-700')
      expect(wrapper.html()).toContain('slate-100')
      expect(wrapper.html()).toContain('slate-800')
    })

    it('should have shimmer effect', () => {
      const wrapper = mount(TextInputSkeleton)
      
      // Check for shimmer class
      expect(wrapper.find('.shimmer').exists()).toBe(true)
    })

    it('should match TextInput component layout', () => {
      const wrapper = mount(TextInputSkeleton)
      
      // Check main structure matches TextInput
      expect(wrapper.find('.space-y-4').exists()).toBe(true)
      expect(wrapper.find('.space-y-3').exists()).toBe(true)
      expect(wrapper.find('.space-y-2').exists()).toBe(true)
      
      // Check for format selection area
      expect(wrapper.find('.flex.items-center.space-x-6').exists()).toBe(true)
      
      // Check for button area
      expect(wrapper.find('.flex.justify-end').exists()).toBe(true)
    })
  })

  describe('Skeleton Animation', () => {
    it('should have pulse animation classes', () => {
      const fileUploaderWrapper = mount(FileUploaderSkeleton)
      const textInputWrapper = mount(TextInputSkeleton)
      
      expect(fileUploaderWrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
      expect(textInputWrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('should have proper animation timing', () => {
      const wrapper = mount(TextInputSkeleton)
      
      // Check that shimmer animation is defined in styles
      expect(wrapper.html()).toContain('shimmer')
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const fileUploaderWrapper = mount(FileUploaderSkeleton)
      const textInputWrapper = mount(TextInputSkeleton)
      
      // Check for dark: prefixed classes
      expect(fileUploaderWrapper.html()).toContain('dark:bg-slate')
      expect(fileUploaderWrapper.html()).toContain('dark:border-slate')
      
      expect(textInputWrapper.html()).toContain('dark:bg-slate')
      expect(textInputWrapper.html()).toContain('dark:border-slate')
    })
  })
})
