# FutureKawa - Logo Assets

This directory contains all logo assets for the FutureKawa application across different platforms and use cases.

## Available Logo Formats

### SVG (Scalable Vector Graphics) - Recommended

#### 1. **futurekawa-logo.svg** (Full Logo with Text)
- **Dimensions**: 520 × 360 px
- **Use Case**: Main branding, large displays, splash screens
- **Format**: Horizontal layout with coffee cup, dragon mascot, and text
- **Scaling**: Can be scaled infinitely without quality loss

#### 2. **futurekawa-logo-icon.svg** (Icon Only)
- **Dimensions**: 200 × 200 px
- **Use Case**: App icon, favicon, navigation bar, sidebar
- **Format**: Compact square with dragon mascot only
- **Scaling**: Perfect for any size from 16px to 512px

#### 3. **futurekawa-logo-vertical.svg** (Vertical Layout)
- **Dimensions**: 200 × 320 px
- **Use Case**: Mobile app layouts, vertical displays
- **Format**: Vertical arrangement with dragon above text

#### 4. **favicon.svg** (Favicon)
- **Dimensions**: 100 × 100 px
- **Use Case**: Browser tab icon, PWA icon
- **Format**: Compact icon with background
- **Note**: Automatically used for favicon requests

### Manifest Files

#### **manifest.json**
- PWA (Progressive Web App) manifest
- Includes icon definitions and app metadata
- Supports maskable icons for adaptive display
- Browser theme colors and descriptions

## Logo Component Colors

- **Primary Color**: `#5b2e1a` (Coffee Brown)
- **Secondary Color**: `#8a6b5a` (Light Brown)
- **Accent Color**: `#3d1f14` (Dark Brown)
- **Background**: `#f5f1ed` (Cream White)

## Usage Guidelines

### In React Components

```tsx
// Icon logo (for navigation, sidebar, small displays)
<img src="/futurekawa-logo-icon.svg" alt="FutureKawa" className="h-9 w-9 object-contain" />

// Full logo (for login page, splash screen)
<img src="/futurekawa-logo-full.svg" alt="FutureKawa" className="h-20 mx-auto object-contain" />

// Vertical logo (for mobile layouts)
<img src="/futurekawa-logo-vertical.svg" alt="FutureKawa" className="w-32 mx-auto object-contain" />
```

### CSS Classes

All logo images automatically use these styles:
- `object-fit: contain` - Preserves aspect ratio
- `max-width: 100%` - Responsive scaling
- `aspect-ratio: 1` - For square icons

### Image Sizing

| Use Case | Width | Height | Class |
|----------|-------|--------|-------|
| Browser Favicon | 16-64px | 16-64px | `h-4 w-4` to `h-16 w-16` |
| Navigation Icon | 32-40px | 32-40px | `h-8 w-8` to `h-10 w-10` |
| Login Page | 80-120px | 80-120px | `h-20 w-20` to `h-32 w-32` |
| Full Logo | 520px | 360px | `max-w-screen-md` |
| Mobile | Responsive | Responsive | `w-full` or `w-3/4` |

## Platform-Specific Recommendations

### Web
- Icon: `futurekawa-logo-icon.svg` (32-48px)
- Full: `futurekawa-logo.svg` (scaled appropriately)

### PWA
- Icon: `futurekawa-logo-icon.svg` (all sizes in manifest)
- Favicon: `favicon.svg`
- Manifest: `manifest.json`

### Mobile App Screenshots
- Full Logo: `futurekawa-logo-full.svg`
- Vertical: `futurekawa-logo-vertical.svg`

### Email/Print
- Full Logo: `futurekawa-logo.svg` (highest quality)
- Icon: `futurekawa-logo-icon.svg` (for signatures)

## Responsive Behavior

All logos maintain their aspect ratio at any size thanks to SVG scaling. The CSS layer ensures:
- ✅ No distortion across different screen sizes
- ✅ Perfect centering with flexbox utilities
- ✅ Automatic dark mode support
- ✅ Proper spacing and padding

## Accessibility

- All logo images have proper `alt` attributes
- Icons are marked as decorative where appropriate
- Sufficient contrast for visibility
- ARIA labels provided in complex layouts

## Version History

- **v2.0** (2026-06-21): New dragon mascot design
  - Updated coffee cup illustration
  - Added vertical layout variant
  - Enhanced favicon design
  - Full SVG ecosystem for scalability

- **v1.0**: Original simple coffee cup logo

---

For questions or modifications, contact the design team.
