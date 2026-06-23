<template>
  <GenericContainer>
    <div class="taxonomy-index tags-index">
      <p v-if="!redirected" class="taxonomy-index__empty">正在跳转到标签…</p>
      <p v-else class="taxonomy-index__empty">暂无标签，请在博客文章的 frontmatter 中添加 tags。</p>
    </div>
  </GenericContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vuepress/client'
import { useExtendPageData } from '@vuepress-reco/vuepress-plugin-page/composables'
import GenericContainer from 'vuepress-theme-reco/lib/client/components/GenericContainer/index.vue'
import { useMagicCard } from 'vuepress-theme-reco/lib/client/composables/index.js'

const { categorySummary } = useExtendPageData()
const router = useRouter()
const route = useRoute()
const redirected = ref(false)

const tags = computed(() => {
  const items = categorySummary?.tags?.items || {}
  return Object.values(items)
})

const { initMagicCard } = useMagicCard()

function redirectToDefaultTag() {
  const list = tags.value
  if (list.length === 0) {
    redirected.value = true
    return
  }

  const first = list[0]
  router.replace(`/tags/${first.categoryValue}/1.html`)
}

onMounted(() => {
  initMagicCard()
  redirectToDefaultTag()
})

watch(route, () => {
  initMagicCard()
})
</script>
