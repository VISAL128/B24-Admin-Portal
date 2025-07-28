# ExSearch Component Documentation

## Overview

`ExSearch` is a reusable search input component built on top of Nuxt UI's `UInput` component. It provides a consistent search experience across the application with built-in clear functionality, debouncing support, and customizable styling.

## Features

- **Built-in clear button**: Automatically shows a clear button when there's input
- **Debouncing support**: Optional debouncing for improved performance
- **Customizable styling**: Full control over appearance and size
- **Event handling**: Comprehensive event system for different interactions
- **Internationalization**: Built-in fallback to translation keys

## Props

| Prop              | Type                                   | Default                             | Description                                         |
| ----------------- | -------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| `modelValue`      | `string`                               | `''`                                | The search input value (v-model)                    |
| `placeholder`     | `string`                               | `undefined`                         | Custom placeholder text (fallback to `t('search')`) |
| `icon`            | `string`                               | `'material-symbols:search-rounded'` | Search icon                                         |
| `clearIcon`       | `string`                               | `'material-symbols:close'`          | Clear button icon                                   |
| `size`            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'`                              | Input size                                          |
| `inputClass`      | `string`                               | `'w-64'`                            | CSS classes for the input                           |
| `disabled`        | `boolean`                              | `false`                             | Disable the input                                   |
| `loading`         | `boolean`                              | `false`                             | Show loading state                                  |
| `showClearButton` | `boolean`                              | `true`                              | Show/hide the clear button                          |
| `debounceMs`      | `number`                               | `0`                                 | Debounce delay in milliseconds                      |

## Events

| Event               | Payload      | Description                                          |
| ------------------- | ------------ | ---------------------------------------------------- |
| `update:modelValue` | `string`     | Emitted when the input value changes (v-model)       |
| `input`             | `string`     | Emitted on input change (with debouncing if enabled) |
| `enter`             | `string`     | Emitted when Enter key is pressed                    |
| `focus`             | `FocusEvent` | Emitted when input is focused                        |
| `blur`              | `FocusEvent` | Emitted when input loses focus                       |
| `clear`             | `void`       | Emitted when clear button is clicked                 |

## Usage Examples

### Basic Usage

```vue
<template>
  <ExSearch v-model="searchQuery" />
</template>

<script setup>
const searchQuery = ref('')
</script>
```

### Custom Placeholder and Size

```vue
<template>
  <ExSearch v-model="searchQuery" :placeholder="t('search_by_name')" size="md" class="w-80" />
</template>
```

### With Debouncing

```vue
<template>
  <ExSearch v-model="searchQuery" :debounce-ms="300" @input="onSearchInput" />
</template>

<script setup>
const searchQuery = ref('')

const onSearchInput = (value: string) => {
  // This will be called 300ms after the user stops typing
  console.log('Debounced search:', value)
}
</script>
```

### With Event Handlers

```vue
<template>
  <ExSearch v-model="searchQuery" @enter="onEnterPressed" @clear="onSearchClear" @focus="onFocus" />
</template>

<script setup>
const searchQuery = ref('')

const onEnterPressed = (value: string) => {
  console.log('Enter pressed with value:', value)
}

const onSearchClear = () => {
  console.log('Search cleared')
}

const onFocus = (event: FocusEvent) => {
  console.log('Input focused')
}
</script>
```

### Loading State

```vue
<template>
  <ExSearch v-model="searchQuery" :loading="isSearching" :disabled="isSearching" />
</template>

<script setup>
const searchQuery = ref('')
const isSearching = ref(false)
</script>
```

## Translation Keys

The component uses the following translation key as fallback:

- `search`: Default placeholder text when no custom placeholder is provided

Make sure this key exists in your localization files:

```json
// en.json
{
  "search": "Search..."
}

// km.json
{
  "search": "ស្វែងរក..."
}
```

## Styling

The component inherits styling from the application's `appConfig.ui.input.slots` and `appConfig.ui.button.slots` configurations, ensuring consistency with the rest of the UI.

You can customize the appearance by:

- Using the `inputClass` prop for custom CSS classes
- Modifying the `size` prop for different input sizes
- Customizing icons via `icon` and `clearIcon` props

## Notes

- The component automatically cleans up debounce timers on unmount
- The clear button only appears when there's input and `showClearButton` is true
- All standard HTML input events are supported through the underlying `UInput` component
