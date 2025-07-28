# StatusSelection Component

A Vue component for selecting single or multiple status values with visual status badges.

## Features

- Single or multi-select status dropdown (configurable)
- Visual status badges using StatusBadgeV2 component
- Translation support
- Searchable options
- Optional pill display with remove functionality (multiple mode only)
- Customizable badge variants and sizes

## Props

| Prop                 | Type                                         | Default      | Description                                      |
| -------------------- | -------------------------------------------- | ------------ | ------------------------------------------------ |
| `modelValue`         | `string \| string[]`                         | `[]` or `''` | Selected status value(s)                         |
| `multiple`           | `boolean`                                    | `true`       | Enable multiple selection mode                   |
| `placeholder`        | `string`                                     | `''`         | Placeholder text for the select menu             |
| `availableStatuses`  | `string[]`                                   | `[]`         | Custom array of status options                   |
| `badgeVariant`       | `"solid" \| "outline" \| "soft" \| "subtle"` | `'subtle'`   | Badge display variant                            |
| `badgeSize`          | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`       | `'sm'`       | Badge size                                       |
| `useTranslation`     | `boolean`                                    | `true`       | Whether to use i18n translations                 |
| `showSelectedPills`  | `boolean`                                    | `false`      | Show removable pill display (multiple mode only) |
| `includeAllStatuses` | `boolean`                                    | `true`       | Include all default statuses                     |

## Events

- `update:modelValue` - Emitted when selection changes

## Usage Examples

### Multiple Selection (Default)

```vue
<template>
  <StatusSelection v-model="selectedStatuses" />
</template>

<script setup>
const selectedStatuses = ref(['pending', 'completed'])
</script>
```

### Single Selection

```vue
<template>
  <StatusSelection v-model="selectedStatus" :multiple="false" placeholder="Select a status..." />
</template>

<script setup>
const selectedStatus = ref('pending')
</script>
```

### Custom Status Options

```vue
<template>
  <StatusSelection
    v-model="selectedStatuses"
    :available-statuses="['active', 'inactive', 'pending']"
    :include-all-statuses="false"
    placeholder="Select status..."
  />
</template>
```

### With Pills Display (Multiple Mode Only)

```vue
<template>
  <StatusSelection
    v-model="selectedStatuses"
    :show-selected-pills="true"
    badge-variant="solid"
    badge-size="md"
  />
</template>
```

### Form Integration - Single Select

```vue
<template>
  <UForm @submit="handleSubmit">
    <UFormGroup label="Status" name="status">
      <StatusSelection v-model="formData.status" :multiple="false" placeholder="Select status..." />
    </UFormGroup>

    <UButton type="submit">Save</UButton>
  </UForm>
</template>

<script setup>
const formData = ref({
  status: '',
})

const handleSubmit = (data) => {
  console.log('Selected status:', data.status)
}
</script>
```

### Form Integration - Multiple Select

```vue
<template>
  <UForm @submit="handleSubmit">
    <UFormGroup label="Filter by Status" name="statuses">
      <StatusSelection v-model="formData.statuses" placeholder="Select statuses to filter..." />
    </UFormGroup>

    <UButton type="submit">Apply Filters</UButton>
  </UForm>
</template>

<script setup>
const formData = ref({
  statuses: [],
})

const handleSubmit = (data) => {
  console.log('Selected statuses:', data.statuses)
}
</script>
```

### With Reference Methods

```vue
<template>
  <div>
    <StatusSelection ref="statusSelector" v-model="selectedStatuses" />

    <div class="mt-4 space-x-2">
      <UButton @click="clearAll">Clear All</UButton>
      <UButton @click="selectAll" :disabled="!isMultiple">Select All</UButton>
    </div>
  </div>
</template>

<script setup>
const statusSelector = ref()
const selectedStatuses = ref([])
const isMultiple = ref(true)

const clearAll = () => {
  statusSelector.value.clearAll()
}

const selectAll = () => {
  statusSelector.value.selectAll()
}
</script>
```

## Behavior Differences

### Multiple Mode (`multiple: true` - default)

- `modelValue` type: `string[]`
- Shows selected statuses as badges below the select
- Optional pill display with remove buttons
- `selectAll()` and `removeStatus()` methods available
- `clearAll()` sets value to `[]`

### Single Mode (`multiple: false`)

- `modelValue` type: `string`
- Shows single selected status as badge below the select
- No pill display (not applicable)
- `selectAll()` and `removeStatus()` methods disabled
- `clearAll()` sets value to `''`

## Default Status Options

The component includes these default statuses based on StatusBadgeV2:

- `success`
- `completed`
- `failed`
- `error`
- `pending`
- `active`
- `inactive`
- `warning`
- `canceled`/`cancelled`
- `expired`
- `reversed`
- `processing`
- `in-progress`

## Styling

The component uses Tailwind CSS classes and integrates with Nuxt UI components. Status badges inherit colors from the StatusBadgeV2 component color mapping.
