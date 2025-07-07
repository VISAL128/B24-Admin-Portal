# Bill24 Management Portal

A Nuxt.js 3 TypeScript application for Bill24's administrative portal with comprehensive settlement management and notification system.

## Overview

This portal allows internal teams to:
- Manage settlement operations manually
- View settlement history and details
- Handle supplier and CPO information
- Monitor system status with real-time notifications

## Technology Stack

- **Framework**: Nuxt.js 3
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Nuxt UI
- **State Management**: Pinia
- **Authentication**: Keycloak (OIDC)
- **Internationalization**: Vue I18n (English/Khmer)
- **Notifications**: Built-in toast system with Bill24 branding

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 🎨 Bill24 Design System

The application follows the Bill24 brand guidelines with the official color scheme:

### Primary Colors
- **Sky Blue**: `#43B3DE` - Primary brand color
- **Black**: `#211e1f` - Primary text
- **White**: `#FFFFFF` - Background

### UI Components
The app uses Nuxt UI components styled with Bill24 branding. All notifications and UI elements follow the established color scheme for consistency.

## 📱 Features

### 🔐 Authentication
- Keycloak integration for secure login
- Role-based access control
- Session management with automatic token refresh

### 💰 Settlement Management
- Generate wallet settlements
- View settlement history with pagination
- Settlement detail views
- Export functionality (Excel/PDF)

### 🔔 Notification System
Comprehensive toast notification system with:
- Success, error, warning, and info messages
- Automatic server error handling
- Multilingual support (English/Khmer)
- Bill24 branded styling

### 🌍 Internationalization
- English and Khmer language support
- Dynamic language switching
- Localized error messages and UI text

## 🚀 Usage Examples

### Notification System

#### Basic Notifications
```typescript
// In any Vue component
<script setup lang="ts">
const notification = useNotification()

// Success notification
const showSuccess = () => {
  notification.showSuccess({
    title: 'Operation Successful',
    description: 'Your request has been processed successfully.'
  })
}

// Error notification
const showError = () => {
  notification.showError({
    title: 'Operation Failed',
    description: 'Something went wrong. Please try again.'
  })
}

// Warning notification
const showWarning = () => {
  notification.showWarning({
    title: 'Warning',
    description: 'Please review your input before proceeding.'
  })
}

// Info notification
const showInfo = () => {
  notification.showInfo({
    title: 'Information',
    description: 'Here is some important information.'
  })
}
</script>
```

#### Error Handling
```typescript
// Automatic error handling in API calls
<script setup lang="ts">
const errorHandler = useErrorHandler()
const { execute } = useApiExecutor()

const loadData = async () => {
  try {
    // API calls automatically show error notifications
    const result = await execute(() => 
      $fetch('/api/settlement-history')
    )
    // Handle success...
  } catch (error) {
    // Additional custom error handling if needed
    errorHandler.handleApiError(error)
  }
}

// Handle validation errors
const validateForm = (formData: any) => {
  if (!formData.email) {
    errorHandler.handleValidationError('Email is required')
    return false
  }
  return true
}

// Show success after operations
const saveSettings = async () => {
  try {
    await saveUserPreferences(settings)
    errorHandler.handleSuccessResponse('Settings saved successfully')
  } catch (error) {
    errorHandler.handleApiError(error)
  }
}
</script>
```

#### Server Error Handling
```typescript
// Server-side error handling (automatic)
// The system automatically detects and shows appropriate messages for:
// - 500: Internal Server Error
// - 502: Bad Gateway  
// - 503: Service Unavailable
// - 504: Gateway Timeout
// - Network errors

// Custom server error handling
const handleServerError = (statusCode: number) => {
  const notification = useNotification()
  notification.showServerError(statusCode, 'Custom error message')
}
```

### API Integration

#### Using API Composables
```typescript
// Settlement API usage
<script setup lang="ts">
const { getSettlementHistory, getSuppliers } = useSupplierApi()

const loadSettlements = async () => {
  try {
    const data = await getSettlementHistory({
      page: 1,
      limit: 10,
      search: searchTerm.value
    })
    settlements.value = data.records
  } catch (error) {
    // Error automatically handled by useApiExecutor
    console.error('Failed to load settlements:', error)
  }
}
</script>
```

#### Storage Management
```typescript
// Using the storage composable
<script setup lang="ts">
const storage = useStorage()

// Store user preferences
const savePreferences = () => {
  storage.setItem('user-preferences', {
    theme: 'dark',
    language: 'en',
    notifications: true
  }, { expiresIn: 30 * 24 * 60 * 60 * 1000 }) // 30 days
}

// Retrieve preferences
const loadPreferences = () => {
  const prefs = storage.getItem('user-preferences')
  if (prefs) {
    applyPreferences(prefs)
  }
}
</script>
```

### Component Usage

#### Settlement Table
```vue
<template>
  <div class="space-y-4">
    <!-- Settlement History Table -->
    <TablesSettlementHistoryTable
      :data="settlements"
      :loading="loading"
      @row-click="viewDetails"
      @export="handleExport"
    />
    
    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />
    
    <!-- Empty State -->
    <TableEmptyState 
      v-if="!loading && settlements.length === 0"
      message="No settlement records found"
    />
  </div>
</template>
```

#### Confirm Button with Loading
```vue
<template>
  <ConfirmButton
    :loading="submitting"
    :confirm-text="t('confirm_settlement')"
    @confirm="submitSettlement"
  >
    {{ t('submit') }}
  </ConfirmButton>
</template>
```

### Internationalization

#### Using Translations
```typescript
// In components
<script setup lang="ts">
const { t, locale } = useI18n()

// Use translations
const title = t('settlement_history_title')
const description = t('settlement_history_subtitle', {
  date: new Date().toLocaleDateString()
})

// Change language
const switchLanguage = (lang: string) => {
  locale.value = lang
}
</script>
```

#### Adding New Translations
```json
// i18n/locales/en.json
{
  "new_feature": {
    "title": "New Feature",
    "description": "Description of the new feature",
    "button_text": "Try Now"
  }
}

// i18n/locales/km.json
{
  "new_feature": {
    "title": "មុខងារថ្មី",
    "description": "ការពិពណ៌នាអំពីមុខងារថ្មី",
    "button_text": "សាកល្បងឥឡូវនេះ"
  }
}
```

### Authentication

#### Route Protection
```typescript
// In page components
definePageMeta({
  middleware: ['auth'],
  auth: true // Requires authentication
})

// Or for public pages
definePageMeta({
  auth: false // No authentication required
})
```

#### Using Auth State
```typescript
<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()

// Check if user is admin
const isAdmin = computed(() => 
  user.value?.roles?.includes('admin')
)

// Handle logout
const handleLogout = async () => {
  try {
    await logout()
    await navigateTo('/login')
  } catch (error) {
    errorHandler.handleApiError(error)
  }
}
</script>
```

## 🧪 Testing

### Test Notifications
Visit `/test/notifications` to test the notification system:
- Success, error, warning, and info notifications
- Server error simulations (500, 502, 503 errors)
- Network error simulation

### Running Tests
```bash
# Run component tests
npm run test

# Run e2e tests
npm run test:e2e

# Test with coverage
npm run test:coverage
```

## 📁 Project Structure

```
app/
├── components/          # Reusable Vue components
│   ├── tables/         # Table components
│   └── ui/             # UI components
├── composables/        # Vue composables
│   ├── api/           # API related composables
│   └── utils/         # Utility composables
├── layouts/           # App layouts
├── middleware/        # Route middleware
├── pages/            # Application pages
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

server/
├── api/              # Server API endpoints
├── logic/            # Business logic
└── model/            # Server-side models

i18n/
└── locales/          # Translation files
```

## 🔧 Configuration

### Environment Variables
```bash
# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080/realms/nuxt-oidc-test
KEYCLOAK_CLIENT_ID=b24-admin-portal
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_REDIRECT_URI=http://localhost:3000/auth/keycloak/callback

# API Configuration
MANAGEMENT_API_URL=https://staging.bill24.io:22030
```

### Nuxt Configuration
The app is configured with:
- Nuxt UI for component library
- Tailwind CSS for styling
- Vue I18n for internationalization
- OIDC Auth for authentication

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Docker Deployment
```bash
# Build Docker image
docker build -t bill24-admin-portal .

# Run container
docker run -p 3000:3000 bill24-admin-portal
```

## 📖 Additional Resources

- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vue I18n Documentation](https://vue-i18n.intlify.dev)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
