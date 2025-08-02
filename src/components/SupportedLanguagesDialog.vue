<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Supported Languages</DialogTitle>
        <DialogDescription>
          The following languages are supported for translation file processing. You can use either the language names or codes in your CSV headers.
        </DialogDescription>
      </DialogHeader>

      <div class="overflow-y-auto max-h-[60vh] pr-2">
        <div class="grid gap-3">
          <div
            v-for="language in supportedLanguages"
            :key="language.code"
            class="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <div class="font-medium text-foreground">
                    {{ language.name }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ language.nativeName }}
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <Badge variant="secondary" class="font-mono text-xs">
                    {{ language.code }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 pt-4 border-t">
        <!-- CSV Usage Examples -->
        <div class="text-sm text-muted-foreground">
          <p class="font-medium mb-2">CSV Usage Examples:</p>
          <div class="space-y-1 text-xs">
            <p>• CSV Header: <code class="bg-muted px-1 rounded">key,english,Chinese simplified,Chinese traditional</code></p>
            <p>• CSV Header: <code class="bg-muted px-1 rounded">Key,en,zh-CN,zh-TW</code></p>
            <p>• Both formats are automatically recognized and supported</p>
          </div>
        </div>

        <!-- JSON Filename Examples -->
        <div class="text-sm text-muted-foreground">
          <p class="font-medium mb-2">JSON Filename Requirements:</p>
          <div class="space-y-2 text-xs">
            <p class="text-orange-600 dark:text-orange-400 font-medium">
              ⚠️ JSON files must follow strict naming convention:
            </p>
            <div class="grid gap-1 ml-4">
              <div v-for="example in filenameExamples" :key="example.language.code" class="flex items-center gap-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                <code class="bg-muted px-2 py-1 rounded font-mono">{{ example.filename }}</code>
                <span class="text-muted-foreground">({{ example.language.name }})</span>
              </div>
            </div>
            <p class="text-red-600 dark:text-red-400 mt-2">
              ❌ Invalid examples: <code class="bg-muted px-1 rounded">en.json</code>, <code class="bg-muted px-1 rounded">english.json</code>, <code class="bg-muted px-1 rounded">translations-en.json</code>
            </p>
          </div>
        </div>

        <div class="flex justify-end">
          <DialogClose as-child>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'
import { getFilenameExamples } from '@/utils/filename-validation'

const supportedLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== null)
const filenameExamples = getFilenameExamples()
</script>
