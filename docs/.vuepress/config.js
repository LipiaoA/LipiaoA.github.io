import { defineUserConfig } from 'vuepress'
import { markdownMathPlugin } from '@vuepress/plugin-markdown-math'
import { recoTheme } from 'vuepress-theme-reco'
import { viteBundler } from '@vuepress/bundler-vite'

const siteTitle = '一个不太喜欢吃的吃货'
const siteDescription = '理解计算机，而不仅仅使用计算机。'

export default defineUserConfig({
  locales: {
    '/': {
      lang: 'zh-CN',
      title: siteTitle,
      description: siteDescription,
    },
  },

  bundler: viteBundler(),

  plugins: [
    markdownMathPlugin({
      type: 'katex',
    }),
  ],

  theme: recoTheme({
    logo: '/logo_n.png',
    author: 'Atlas Lip',
    colorMode: 'auto',
    autoSetBlogCategories: false,
    autoAddCategoryToNavbar: false,

    locales: {
      '/': {
        selectLanguageName: '简体中文',
        lastUpdatedText: '最后更新时间',
        catalogTitle: '页面导航',
        tip: '提示',
        info: '信息',
        warning: '警告',
        danger: '危险',
        details: '详情',
        editLinkText: '编辑当前页面',
        notFound: '哇哦，没有发现这个页面！',
        backToHome: '返回首页',
        navbar: [
          { text: '首页', link: '/', icon: 'IconHome' },
          { text: '博客', link: '/posts', icon: 'IconDocumentAttachment' },
          { text: '分类', link: '/categories', icon: 'IconFolder' },
          { text: '标签', link: '/tags', icon: 'IconTag' },
          { text: '关于', link: '/about', icon: 'IconUser' },
        ],
      },
    },
  }),
})
