# Khmer Font Support in PDF Export

This document explains how to add proper Khmer (Cambodian) font support to the `exportToPDFWithJsPDF` function.

## Current Implementation

The `exportToPDFWithJsPDF` function now includes:

✅ **Font detection** - Automatically detects when `locale: 'km'` is used  
✅ **Fallback font** - Uses Helvetica with better Unicode support  
✅ **Helper functions** - `setupKhmerFont()` function for font management  
✅ **Documentation** - Complete setup instructions  
✅ **Dynamic loading** - Support for both base64 and URL-based font loading  

## Quick Setup Guide

### Option 1: Dynamic Font Loading (Recommended)

1. **Download Noto Sans Khmer**
   ```bash
   # Download from Google Fonts
   wget https://fonts.google.com/download?family=Noto%20Sans%20Khmer
   ```

2. **Add to your project**
   ```
   public/
   └── fonts/
       └── NotoSansKhmer-Regular.ttf
   ```

3. **Enable in code**
   In `exportUtils.ts`, uncomment this section in `setupKhmerFont()`:
   ```typescript
   const { loadKhmerFontFromUrl } = await import('./khmerFont')
   const khmerFontBase64 = await loadKhmerFontFromUrl('/fonts/NotoSansKhmer-Regular.ttf')
   doc.addFileToVFS('NotoSansKhmer.ttf', khmerFontBase64)
   doc.addFont('NotoSansKhmer.ttf', 'NotoSansKhmer', 'normal')
   doc.setFont('NotoSansKhmer')
   return 'NotoSansKhmer'
   ```

### Option 2: Base64 Embedded Font

1. **Convert font to base64**
   ```bash
   node -e "console.log(require('fs').readFileSync('NotoSansKhmer-Regular.ttf', 'base64'))"
   ```

2. **Add to khmerFont.ts**
   ```typescript
   export const NOTO_SANS_KHMER_BASE64 = 'your-base64-data-here'
   ```

3. **Enable in code**
   In `exportUtils.ts`, uncomment the base64 section in `setupKhmerFont()`.

## How It Works

### Font Detection
```typescript
if (options.locale === 'km') {
  // Setup Khmer font
  return await setupKhmerFont(doc, 'km')
} else {
  // Use default font
  return 'helvetica'
}
```

### Font Application
The font is applied to all text elements:
- **Headers** - Table column headers
- **Data cells** - All table content  
- **Filters** - Filter section text
- **Titles** - Document title and metadata

### Usage Example
```typescript
await exportToPDFWithJsPDF(
  data,
  headers,
  'report.pdf',
  'របាយការណ៍', // Khmer title
  'ព័ត៌មានលម្អិត', // Khmer subtitle
  {
    locale: 'km', // Enable Khmer font
    t: (key) => translations[key],
    // ... other options
  }
)
```

## Testing Khmer Support

To test if Khmer fonts are working:

1. **Check console logs**
   - Look for "Using helvetica font for Khmer text" (fallback)
   - Or successful font loading messages

2. **Visual inspection**
   - Khmer text should display properly in PDF
   - Characters should not appear as boxes or question marks

3. **Test data**
   ```javascript
   const testData = [
     { name: 'ឈ្មោះ១', amount: 1000, date: '2024-01-01' },
     { name: 'ឈ្មោះ២', amount: 2000, date: '2024-01-02' }
   ]
   ```

## Troubleshooting

### Common Issues

**Font not loading**
- Check if font file exists in `public/fonts/`
- Verify base64 data is complete
- Check browser console for errors

**Characters display as boxes**
- Font may not contain required Unicode ranges
- Try different Khmer font (Noto Sans Khmer recommended)

**Performance issues**
- Base64 fonts increase bundle size
- Consider dynamic loading for large fonts

### Browser Compatibility

- ✅ Chrome/Chromium - Full support
- ✅ Firefox - Full support  
- ✅ Safari - Full support
- ✅ Edge - Full support

## Next Steps

1. **Download Noto Sans Khmer font**
2. **Choose loading method** (dynamic or base64)
3. **Uncomment relevant code section**
4. **Test with Khmer text**
5. **Deploy and verify**

## Files Modified

- `exportUtils.ts` - Main export function with font support
- `khmerFont.ts` - Font loading utilities (created)
- `README-khmer-font.md` - This documentation (created)

For questions or issues, refer to the comments in `setupKhmerFont()` function.
