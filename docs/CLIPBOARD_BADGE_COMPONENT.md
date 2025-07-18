# ClipboardBadge Component

A versatile badge component that displays text with built-in copy-to-clipboard functionality. Perfect for displaying Payment IDs, account numbers, API keys, or any copyable content with visual feedback.

## Features

- ✅ One-click copy to clipboard
- ✅ Visual feedback with icon change (copy → check)
- ✅ Tooltip support with customizable text
- ✅ Text truncation with configurable length
- ✅ Success/error notifications
- ✅ Keyboard accessibility (Enter/Space)
- ✅ Internationalization support
- ✅ Consistent Bill24 styling
- ✅ Dark mode support

## Usage

### Basic Usage

```vue
<ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" />
```

### With Label

```vue
<ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" label="Payment ID" />
```

### Custom Length Limit

```vue
<ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :max-length="15" />
```

### Without Copy Icon

```vue
<ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" :show-icon="false" />
```

### Custom Tooltip Text

```vue
<ClipboardBadge
  text="pi_3RM3bFB4GYNtG73L0kYxJJG5"
  tooltip-text="Click to copy payment ID"
  copied-tooltip-text="Payment ID copied!"
/>
```

## Props

| Prop                | Type      | Default    | Description                                                          |
| ------------------- | --------- | ---------- | -------------------------------------------------------------------- |
| `text`              | `string`  | _required_ | The text to be copied to clipboard                                   |
| `label`             | `string`  | `''`       | Optional label to display before the text                            |
| `maxLength`         | `number`  | `20`       | Maximum number of characters to display (will be truncated with ...) |
| `tooltipText`       | `string`  | _auto_     | Custom tooltip text when not copied (defaults to translation)        |
| `copiedTooltipText` | `string`  | _auto_     | Custom tooltip text when copied (defaults to translation)            |
| `showIcon`          | `boolean` | `true`     | Whether to show the copy/check icon                                  |

## Real-world Examples

### Payment Transaction Card

```vue
<div class="p-4 border rounded-lg">
  <div class="flex items-center justify-between">
    <div>
      <h4 class="font-medium">Payment Transaction</h4>
      <p class="text-sm text-gray-600">Completed payment for order #12345</p>
    </div>
    <ClipboardBadge text="pi_3RM3bFB4GYNtG73L0kYxJJG5" label="Payment ID" />
  </div>
</div>
```

### Bank Account Information

```vue
<div class="p-4 border rounded-lg">
  <div class="flex items-center justify-between">
    <div>
      <h4 class="font-medium">Bank Account</h4>
      <p class="text-sm text-gray-600">Primary checking account</p>
    </div>
    <ClipboardBadge text="1234567890123456" label="Account" :max-length="12" />
  </div>
</div>
```

### API Key Display

```vue
<div class="p-4 border rounded-lg">
  <div class="flex items-center justify-between">
    <div>
      <h4 class="font-medium">API Key</h4>
      <p class="text-sm text-gray-600">Production environment key</p>
    </div>
    <ClipboardBadge
      text="sk_live_51HYZ3pJqQ9aB2C3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA5bC6dE7fG8hI9jK"
      :max-length="20"
      tooltip-text="Click to copy API key"
      copied-tooltip-text="API key copied to clipboard!"
    />
  </div>
</div>
```

## Accessibility

The component includes proper accessibility features:

- `role="button"` for screen readers
- `aria-label` describing the copy action
- Keyboard navigation support (Enter/Space keys)
- Focus management
- Semantic HTML structure

## Internationalization

The component uses the following translation keys:

- `copy_success` - Toast notification title when copy succeeds
- `copy_success_message` - Toast notification message when copy succeeds
- `copy_to_clipboard` - Default tooltip text for copy action
- `copy_failed` - Toast notification title when copy fails
- `copy_failed_message` - Toast notification message when copy fails

## Dependencies

- `UBadge` - Nuxt UI Badge component
- `UTooltip` - Nuxt UI Tooltip component
- `useClipboard` - Custom composable for clipboard operations
- `useNotification` - Custom composable for toast notifications
- `useI18n` - Internationalization composable

## Test Page

Visit `/test/clipboard-badge` to see the component in action with various configurations and real-world examples.
