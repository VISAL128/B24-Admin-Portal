export default defineAppConfig({
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'],
      transitions: true,
    },

    // Table component customization
    table: {
      slots: {
        td: 'text-xxs py-3 cursor-pointer',
        th: 'tb-h-text py-2',
      },
    },

    // Card component customization
    card: {
      slots: {
        root: 'rounded-lg overflow-hidden bg-white dark:bg-gray-800',
        header: 'p-3 sm:px-4',
        body: 'p-3',
        footer: 'p-4 sm:px-6',
      },
      variants: {
        variant: {
          solid: {
            root: 'bg-inverted text-inverted',
          },
          outline: {
            root: 'bg-default ring ring-default divide-y divide-default',
          },
          soft: {
            root: 'bg-elevated/50 divide-y divide-default',
          },
          subtle: {
            root: 'bg-elevated/50 ring ring-default divide-y divide-default',
          },
        },
      },
      defaultVariants: {
        variant: 'outline',
      },
    },
    pagination: {
      slots: {
        item: 'w-7 justify-center',
      },
    },
    dropdownMenu: {
      slots: {
        itemLeadingIcon: 'shrink-0 size-4',
      },
    },
    button: {
      slots: {
        leadingIcon: 'shrink-0 size-4 text-muted',
        trailingIcon: 'shrink-0 size-4 text-muted',
      },
    },
    input: {
      slots: {
        leading: 'ps-2',
        leadingIcon: 'shrink-0 size-4 text-muted',
        trailing: 'pe-2',
        trailingIcon: 'shrink-0 size-4 text-muted',
      },
    },
  },
})
