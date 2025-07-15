# Profile Error Handling System

This document describes the profile error handling system that prevents users without valid profiles from accessing the Bill24 Management Portal.

## Overview

The system provides a comprehensive solution for handling profile-related errors during user authentication and initialization. When a user's profile cannot be retrieved or validated, they are redirected to a dedicated error page instead of being allowed into the system.

## Components

### 1. Profile Error Page (`/profile-error`)

**Location**: `app/pages/profile-error.vue`

A dedicated page that displays when profile retrieval fails. Features:

- Clear error messaging in both English and Khmer
- Retry functionality
- Contact support option
- Logout capability
- Follows Bill24 color scheme and design guidelines

### 2. Profile Validation Composable

**Location**: `app/composables/useProfileValidation.ts`

Provides reusable profile validation logic:

```typescript
const { validateProfile, handleProfileError, getValidatedProfile } = useProfileValidation()
```

**Methods**:

- `validateProfile(profile)`: Validates profile response structure
- `handleProfileError(error)`: Handles profile errors and redirects
- `getValidatedProfile()`: Gets validated profile from storage
- `isProfileErrorPage()`: Checks if current route is profile error page

### 3. Profile Middleware

**Location**: `app/middleware/profile.ts`

Route middleware that validates user profiles before allowing access to protected routes:

- Runs on all routes except `/profile-error` and public routes
- Validates profile existence and structure
- Redirects to profile error page if validation fails

### 4. Enhanced Splash Screen

**Location**: `app/composables/useSplashScreen.ts`

Updated to include profile validation during app initialization:

- Validates profile response from PGW Module API
- Redirects to profile error page on validation failure
- Uses the profile validation composable for consistency

## Error Scenarios

The system handles the following profile error scenarios:

1. **Profile API returns null/undefined**
2. **Profile API returns invalid response code (not '000')**
3. **Profile API returns empty data**
4. **Network/connection errors during profile retrieval**
5. **Profile API throws exceptions**

## Translation Keys

### English (`i18n/locales/en.json`)

```json
{
  "profile_error": {
    "title": "Profile Access Error",
    "message": "We're unable to retrieve your profile information...",
    "possible_reasons": "Possible reasons:",
    "reason_1": "Your profile may not exist in the system",
    "reason_2": "Network connectivity issues",
    "reason_3": "Temporary server problems",
    "try_again": "Try Again",
    "retrying": "Retrying...",
    "contact_support": "Contact Support",
    "logout": "Logout",
    "support_info": "If this problem persists, please contact our support team..."
  }
}
```

### Khmer (`i18n/locales/km.json`)

```json
{
  "profile_error": {
    "title": "កំហុសក្នុងការចូលប្រវត្តិរូប",
    "message": "យើងមិនអាចទាញយកព័ត៌មានប្រវត្តិរូបរបស់អ្នកបានទេ..."
    // ... other Khmer translations
  }
}
```

## Usage Examples

### In Splash Screen

```typescript
const { validateProfile, handleProfileError } = useProfileValidation()

try {
  const profile = await pgwApi.getProfile()
  if (!validateProfile(profile)) {
    await handleProfileError(new Error('Profile validation failed'))
    return false
  }
  // Continue with app initialization
} catch (error) {
  await handleProfileError(error)
  return false
}
```

### In Route Middleware

```typescript
// middleware/profile.ts automatically validates profiles
// on route navigation - no additional code needed
```

### Manual Profile Validation

```typescript
const { getValidatedProfile } = useProfileValidation()

const profile = getValidatedProfile()
if (!profile) {
  // Handle missing profile
}
```

## Design Guidelines

The profile error page follows Bill24 design system:

- **Primary Color**: `#3F83F8` (Sky Blue) for primary actions
- **Text Color**: `#211e1f` (Black) for main text
- **Background**: White with Sky Blue gradient
- **Error Indicators**: Red colors for error states
- **Typography**: Clear hierarchy with proper spacing

## Security Considerations

1. **Data Clearing**: All profile data is cleared when errors occur
2. **Cookie Management**: Profile cookies are properly invalidated
3. **No Sensitive Data**: Error messages don't expose sensitive information
4. **Secure Logout**: Proper cleanup during logout process

## Testing Scenarios

To test the profile error system:

1. **Simulate API Error**: Mock the PGW Module API to return error responses
2. **Network Issues**: Test with network disconnection
3. **Invalid Profile Data**: Test with malformed profile responses
4. **UI Testing**: Verify error page displays correctly in both languages
5. **Navigation Testing**: Ensure proper redirects and middleware behavior

## Troubleshooting

### Common Issues

1. **Infinite Redirects**: Check that profile error page has `auth: false` in page meta
2. **Middleware Loops**: Ensure middleware properly excludes profile error page
3. **Type Errors**: Verify proper TypeScript types for profile validation
4. **Translation Missing**: Check that all translation keys are present in both locales

### Debug Mode

Enable debug logging by setting console log level to see detailed profile validation messages.

## Future Enhancements

Potential improvements to the system:

1. **Retry Logic**: Implement exponential backoff for automatic retries
2. **Offline Support**: Handle offline scenarios gracefully
3. **Profile Caching**: Implement intelligent profile caching strategies
4. **Analytics**: Track profile error occurrences for monitoring
5. **Custom Error Types**: More specific error handling for different failure modes

## Logout Process

### Enhanced Profile Data Cleanup

The logout process has been enhanced to automatically clear all profile-related data:

```typescript
// In useAuth composable
const logout = async (): Promise<void> => {
  try {
    // Clear profile data before logout using the dedicated method
    clearProfileData()

    // Also clear user preferences (optional)
    const storage = useStorage()
    storage.removeItem('user-preferences')

    // Perform OIDC logout
    await oidc.logout()
  } catch (error) {
    // Even if OIDC logout fails, ensure profile data is cleared
    clearProfileData()
    // ... error handling
  }
}
```

### What Gets Cleared During Logout

1. **Profile Cookie**: The profile cookie is set to null
2. **LocalStorage Profile**: Profile data is removed from localStorage
3. **User Preferences**: User settings and preferences are cleared (optional)
4. **OIDC Session**: The OIDC authentication session is terminated

### Centralized Profile Cleanup

The `useProfileValidation` composable provides a centralized `clearProfileData()` method that:

- Removes profile data from localStorage
- Clears the profile cookie
- Provides consistent logging
- Handles errors gracefully

This method is used across:

- Logout process in `useAuth`
- Profile error handling in `useProfileValidation`
- Test utilities for development
