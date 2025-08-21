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
        tbody: 'bg-default',
        thead: 'bg-default',
        tr: 'border-b border-default data-[selected=true]:bg-elevated/50',
      },
    },
    chip: {
      variants: {
        size: {
          '3xl': 'text-[8px]',
        },
      },
    },

    checkbox: {
      slots: {
        root: 'relative flex items-start',
        container: 'flex items-center',
        base: 'rounded-sm ring ring-inset ring-accented overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2',
        indicator: 'flex items-center justify-center size-full text-inverted',
        icon: 'shrink-0 size-full',
        wrapper: 'w-full',
        label: 'block font-medium text-default',
        description: 'text-muted',
      },
      variants: {
        color: {
          primary: {
            base: 'focus-visible:outline-primary',
            indicator: 'bg-primary',
          },
          secondary: {
            base: 'focus-visible:outline-secondary',
            indicator: 'bg-secondary',
          },
          success: {
            base: 'focus-visible:outline-success',
            indicator: 'bg-success',
          },
          info: {
            base: 'focus-visible:outline-info',
            indicator: 'bg-info',
          },
          warning: {
            base: 'focus-visible:outline-warning',
            indicator: 'bg-warning',
          },
          error: {
            base: 'focus-visible:outline-error',
            indicator: 'bg-error',
          },
          neutral: {
            base: 'focus-visible:outline-inverted',
            indicator: 'bg-inverted',
          },
        },
        variant: {
          list: {
            root: '',
          },
          card: {
            root: 'border border-muted rounded-lg',
          },
        },
        indicator: {
          start: {
            root: 'flex-row',
            wrapper: 'ms-2',
          },
          end: {
            root: 'flex-row-reverse',
            wrapper: 'me-2',
          },
          hidden: {
            base: 'sr-only',
            wrapper: 'text-center',
          },
        },
        size: {
          xs: {
            base: 'size-3',
            container: 'h-4',
            wrapper: 'text-xs',
          },
          sm: {
            base: 'size-3.5',
            container: 'h-4',
            wrapper: 'text-xs',
          },
          md: {
            base: 'size-4',
            container: 'h-5',
            wrapper: 'text-sm',
          },
          lg: {
            base: 'size-4.5',
            container: 'h-5',
            wrapper: 'text-sm',
          },
          xl: {
            base: 'size-5',
            container: 'h-6',
            wrapper: 'text-base',
          },
        },
        required: {
          true: {
            label: "after:content-['*'] after:ms-0.5 after:text-error",
          },
        },
        disabled: {
          true: {
            base: 'cursor-not-allowed opacity-75',
            label: 'cursor-not-allowed opacity-75',
            description: 'cursor-not-allowed opacity-75',
          },
        },
        checked: {
          true: '',
        },
      },
      compoundVariants: [
        {
          size: 'xs',
          variant: 'card',
          class: {
            root: 'p-2.5',
          },
        },
        {
          size: 'sm',
          variant: 'card',
          class: {
            root: 'p-3',
          },
        },
        {
          size: 'md',
          variant: 'card',
          class: {
            root: 'p-3.5',
          },
        },
        {
          size: 'lg',
          variant: 'card',
          class: {
            root: 'p-4',
          },
        },
        {
          size: 'xl',
          variant: 'card',
          class: {
            root: 'p-4.5',
          },
        },
        {
          color: 'primary',
          variant: 'card',
          class: {
            root: 'has-data-[state=checked]:border-primary',
          },
        },
        {
          color: 'neutral',
          variant: 'card',
          class: {
            root: 'has-data-[state=checked]:border-inverted',
          },
        },
        {
          variant: 'card',
          disabled: true,
          class: {
            root: 'cursor-not-allowed opacity-75',
          },
        },
      ],
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'list',
        indicator: 'start',
      },
    },
    // Card component customization
    card: {
      slots: {
        root: 'rounded-lg overflow-hidden',
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
        base: 'min-w-16 justify-center',
      },
    },
    input: {
      slots: {
        leading: 'ps-2',
        leadingIcon: 'shrink-0 size-4 text-gray-400',
        trailing: 'pe-2',
        trailingIcon: 'shrink-0 size-4 text-muted',
      },
    },
    modal: {
      slots: {
        header: 'flex justify-between items-center',
        footer: 'flex justify-end items-center gap-1.5 p-4 sm:px-6',
      },
    },
    slideover: {
      slots: {
        header: 'flex justify-between items-center',
        footer: 'flex justify-end items-center gap-1.5 p-4 sm:px-6',
      },
    },
  },
})
