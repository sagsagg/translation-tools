<script setup lang="ts">
import { DropdownMenuTrigger } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  asChild?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <DropdownMenuTrigger :as-child="props.asChild" :class="cn('', props.class)">
    <slot />
  </DropdownMenuTrigger>
</template>
