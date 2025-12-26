# Image Assets

## Login Background Image

The current `login-bg.svg` is a placeholder with an industrial theme. 

### To replace with your actual image:

1. Add your image file to this directory (e.g., `login-bg.jpg`, `login-bg.png`, etc.)
2. Update the import in `/src/pages/LoginPage.tsx`:

```typescript
// Change this line:
import loginBg from '../assets/images/login-bg.svg'

// To (depending on your image format):
import loginBg from '../assets/images/login-bg.jpg'
// or
import loginBg from '../assets/images/login-bg.png'
```

### Recommended image specifications:
- **Aspect Ratio**: 16:9 or wider
- **Minimum Resolution**: 1920x1080px
- **Format**: JPG, PNG, or WebP
- **File Size**: Optimize to < 500KB for best performance

## Logo

The `petrozen-logo.svg` is used in:
- Login page (top left on mobile, left side on desktop)
- Sidebar (top section)

To update the logo, simply replace the `petrozen-logo.svg` file with your own SVG logo, maintaining the same filename.

