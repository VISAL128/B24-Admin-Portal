export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue', // Will be overridden by CSS variables to use Bill24 sky blue
      neutral: '#f9fafb' // Will be overridden by CSS variables to use Bill24 neutral
    },
    table: {
      slots: {
        root: 'bg-white dark:bg-gray-800',
        base: 'border border-red-500 dark:border-red-800', // Base class for table borders
        empty: 'TableEmptyState',
        header: 'TableHeader',
        footer: 'TableFooter'
      },
      background: {
        color: 'red-500',
        dark: 'gray-800'
      },
      border: {
        color: '#ff0000', // Bill24 black 40% tint for light mode
        dark: '#ff0000' // Bill24 black 80% tint for dark mode
      }
    }
  }
})
