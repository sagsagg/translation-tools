<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-full justify-between min-h-10"
      >
        <div class="flex flex-wrap gap-1 flex-1">
          <div
            v-if="selectedItems.length === 0"
            class="text-muted-foreground"
          >
            {{ placeholder }}
          </div>
          <Badge
            v-for="item in selectedItems.slice(0, maxDisplayItems)"
            :key="getItemValue(item)"
            variant="secondary"
            class="text-xs"
          >
            {{ getItemLabel(item) }}
            <button
              class="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              @click.stop="removeItem(item)"
            >
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </Badge>
          <Badge
            v-if="selectedItems.length > maxDisplayItems"
            variant="secondary"
            class="text-xs"
          >
            +{{ selectedItems.length - maxDisplayItems }} more
          </Badge>
        </div>
        <svg
          class="ml-2 h-4 w-4 shrink-0 opacity-50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
        </svg>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-full p-0" align="start">
      <Command>
        <CommandInput
          :placeholder="searchPlaceholder"
          class="h-9"
          v-model:search-term="searchTerm"
        />
        <CommandList>
          <CommandEmpty>{{ emptyMessage }}</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="item in filteredItems"
              :key="getItemValue(item)"
              :value="getItemValue(item)"
              @select="toggleItem(item)"
              class="cursor-pointer"
            >
              <div class="flex items-center space-x-2 flex-1">
                <div
                  class="flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
                  :class="{
                    'bg-primary text-primary-foreground': isSelected(item)
                  }"
                >
                  <svg
                    v-if="isSelected(item)"
                    class="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="font-medium">{{ getItemLabel(item) }}</div>
                  <div
                    v-if="getItemDescription && getItemDescription(item)"
                    class="text-sm text-muted-foreground"
                  >
                    {{ getItemDescription(item) }}
                  </div>
                </div>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Props<T> {
  items: T[]
  selectedItems: T[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  maxDisplayItems?: number
  getItemValue: (item: T) => string
  getItemLabel: (item: T) => string
  getItemDescription?: (item: T) => string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props<T>>(), {
  placeholder: 'Select items...',
  searchPlaceholder: 'Search items...',
  emptyMessage: 'No items found.',
  maxDisplayItems: 3,
  disabled: false
})

const emit = defineEmits<{
  'update:selectedItems': [items: T[]]
  'item-select': [item: T]
  'item-remove': [item: T]
}>()

const open = ref(false)
const searchTerm = ref('')

const filteredItems = computed(() => {
  if (!searchTerm.value) {
    return props.items
  }
  
  const search = searchTerm.value.toLowerCase()
  return props.items.filter(item => {
    const label = props.getItemLabel(item).toLowerCase()
    const description = props.getItemDescription?.(item)?.toLowerCase() || ''
    return label.includes(search) || description.includes(search)
  })
})

function isSelected(item: T): boolean {
  return props.selectedItems.some(selected => 
    props.getItemValue(selected) === props.getItemValue(item)
  )
}

function toggleItem(item: T): void {
  if (props.disabled) return
  
  const isCurrentlySelected = isSelected(item)
  let newSelectedItems: T[]
  
  if (isCurrentlySelected) {
    newSelectedItems = props.selectedItems.filter(selected => 
      props.getItemValue(selected) !== props.getItemValue(item)
    )
    emit('item-remove', item)
  } else {
    newSelectedItems = [...props.selectedItems, item]
    emit('item-select', item)
  }
  
  emit('update:selectedItems', newSelectedItems)
}

function removeItem(item: T): void {
  if (props.disabled) return
  
  const newSelectedItems = props.selectedItems.filter(selected => 
    props.getItemValue(selected) !== props.getItemValue(item)
  )
  
  emit('update:selectedItems', newSelectedItems)
  emit('item-remove', item)
}

// Clear search when popover closes
watch(open, (isOpen) => {
  if (!isOpen) {
    searchTerm.value = ''
  }
})
</script>
