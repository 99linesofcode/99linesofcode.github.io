import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "99linesofthought",
  titleTemplate: "99linesofcode",
  description: "A collection of thoughts, ideas and code I felt were worth sharing",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Ansible',
        items: [
          { text: 'Provisioning your server', link: '/ansible/provisioning' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
