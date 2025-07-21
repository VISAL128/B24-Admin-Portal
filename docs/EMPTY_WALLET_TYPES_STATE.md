# Empty Wallet Types State Implementation

## Overview

Added comprehensive handling for when no wallet types are available from the API, providing a better user experience with clear messaging and retry functionality.

## Changes Made

### 1. Wallet Type Selector

- **Conditional Display**: Only shows the USelectMenu when wallet types are available or loading
- **Empty State Message**: Displays a warning message when no wallet types are available
- **Visual Feedback**: Uses appropriate icons and styling for the empty state

### 2. Wallet Balance Cards

- **Conditional Rendering**: Only shows balance cards when wallet types are available
- **Empty State Card**: Displays a centered card with:
  - Wallet icon
  - Clear title and message
  - Retry button to reload wallet types
  - Professional styling with proper spacing

### 3. Transaction Summary

- **Conditional Display**: Only shows when wallet types are available
- **Prevents Errors**: Avoids showing transaction summary with no wallet context

### 4. Color System Enhancement

- **Default Colors**: Added fallback colors for empty state
- **Graceful Degradation**: Handles missing wallet types gracefully
- **Consistent Styling**: Maintains design consistency even with no data

### 5. Internationalization

- **English Translations**: Added comprehensive messages for empty states
- **Khmer Translations**: Added localized messages for Khmer users
- **User-Friendly Messages**: Clear, actionable messages for users

## New Translation Keys

### English (en.json)

```json
{
  "wallet_page": {
    "loading_wallet_types": "Loading wallet types...",
    "no_wallet_types": "No wallet types available",
    "no_wallets_title": "No Wallets Available",
    "no_wallets_message": "No wallet types are currently available. Please contact your administrator or try again later.",
    "retry": "Retry",
    "settlement_wallet": "Settlement Wallet",
    "wallet": "Wallet"
  }
}
```

### Khmer (km.json)

```json
{
  "wallet_page": {
    "loading_wallet_types": "កំពុងទាញយកប្រភេទកាបូប...",
    "no_wallet_types": "មិនមានប្រភេទកាបូបទេ",
    "no_wallets_title": "មិនមានកាបូបទេ",
    "no_wallets_message": "មិនមានប្រភេទកាបូបនៅពេលនេះទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង ឬព្យាយាមម្តងទៀតនៅពេលក្រោយ។",
    "retry": "ព្យាយាមម្តងទៀត",
    "settlement_wallet": "កាបូបទូទាត់",
    "wallet": "កាបូប"
  }
}
```

## User Experience Improvements

### 1. Clear Communication

- **Warning Icon**: Uses exclamation triangle to indicate issue
- **Descriptive Messages**: Explains what's happening and next steps
- **Actionable Buttons**: Provides retry functionality

### 2. Visual Consistency

- **Consistent Styling**: Maintains design language even in empty states
- **Proper Spacing**: Uses appropriate padding and margins
- **Professional Appearance**: Clean, modern design

### 3. Accessibility

- **Screen Reader Friendly**: Proper semantic HTML structure
- **Keyboard Navigation**: Retry button is keyboard accessible
- **Clear Visual Hierarchy**: Proper heading structure and text contrast

### 4. Loading States

- **Loading Feedback**: Shows spinner during wallet type loading
- **Disabled States**: Prevents interaction during loading
- **Progressive Enhancement**: Graceful handling of loading states

## Technical Implementation

### Conditional Rendering

```vue
<!-- Shows when wallet types available or loading -->
<USelectMenu v-if="walletTypes.length > 0 || isLoadingWalletTypes" ... />

<!-- Shows when no wallet types available -->
<div v-else class="empty-state">
  <!-- Empty state message -->
</div>
```

### Empty State Card

```vue
<UCard class="max-w-md w-full">
  <div class="text-center space-y-4">
    <!-- Icon, title, message, and retry button -->
  </div>
</UCard>
```

### Color System Enhancement

```typescript
const walletTypeColors = computed(() => {
  // ... existing colors

  if (walletTypes.value.length === 0) {
    return colors.default // Fallback colors
  }

  return colors[selectedWalletType.value] || colors.personal_wallet
})
```

## Benefits

1. **Better User Experience**: Clear feedback when no data is available
2. **Error Recovery**: Easy retry mechanism for users
3. **Internationalization**: Localized messages for all supported languages
4. **Accessibility**: Screen reader friendly and keyboard accessible
5. **Professional Appearance**: Maintains design consistency
6. **Graceful Degradation**: Handles edge cases smoothly

## Testing Scenarios

1. **Empty API Response**: When API returns no wallet types
2. **API Error**: When API call fails
3. **Loading States**: During API calls
4. **Retry Functionality**: When user clicks retry button
5. **Language Switching**: Ensure translations work correctly
