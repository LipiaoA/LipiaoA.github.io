import { defineClientConfig } from 'vuepress/client'
import CategoriesIndex from './layouts/CategoriesIndex.vue'
import TagsIndex from './layouts/TagsIndex.vue'

export default defineClientConfig({
  layouts: {
    CategoriesIndex,
    TagsIndex,
  },
})
