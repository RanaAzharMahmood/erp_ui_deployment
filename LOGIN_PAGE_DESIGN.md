# Login Page Design Reference

## Desktop Layout (1920x1080)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────────────────────────┬──────────────────────────────────┐   │
│  │                                  │                                  │   │
│  │  [PETROZEN Logo]                 │                                  │   │
│  │                                  │     welcome Back!                │   │
│  │                                  │     Log in to start your         │   │
│  │                                  │                                  │   │
│  │                                  │     Email                        │   │
│  │                                  │     ┌──────────────────────┐    │   │
│  │                                  │     │ Input your email     │    │   │
│  │  Industrial Background           │     └──────────────────────┘    │   │
│  │  with Orange Gradient            │                                  │   │
│  │                                  │     Password                     │   │
│  │  [Tank Structures]               │     ┌──────────────────────┐    │   │
│  │  [Pipes & Industrial Elements]   │     │ Password             │    │   │
│  │                                  │     └──────────────────────┘    │   │
│  │                                  │                                  │   │
│  │                                  │     ☐ Remember Me                │   │
│  │                                  │                                  │   │
│  │  ERP System For Your             │     ┌──────────────────────┐    │   │
│  │  Fast Work Flow                  │     │  Login          →    │    │   │
│  │                                  │     └──────────────────────┘    │   │
│  │  Lorem ipsum dolor sit amet...   │                                  │   │
│  │                                  │                                  │   │
│  └──────────────────────────────────┴──────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Layout (375x812)

```
┌─────────────────────────────┐
│                             │
│    [PETROZEN Logo]          │
│                             │
│                             │
│    welcome Back!            │
│    Log in to start your     │
│                             │
│    Email                    │
│    ┌─────────────────────┐ │
│    │ Input your email    │ │
│    └─────────────────────┘ │
│                             │
│    Password                 │
│    ┌─────────────────────┐ │
│    │ Password            │ │
│    └─────────────────────┘ │
│                             │
│    ☐ Remember Me            │
│                             │
│    ┌─────────────────────┐ │
│    │  Login          →   │ │
│    └─────────────────────┘ │
│                             │
│                             │
└─────────────────────────────┘
```

## Color Palette

```
Primary Orange:     #FF6B35  ████████
Secondary Orange:   #FF8E53  ████████
Light Orange:       #FFB088  ████████
Dark Background:    #1A1A1A  ████████
Dark Text:          #1A1A1A  ████████
Medium Text:        #666666  ████████
Light Gray:         #F5F5F5  ████████
White:              #FFFFFF  ████████
```

## Typography Scale

```
Heading (Desktop):  56px / Bold (700)
Heading (Mobile):   48px / Bold (700)
Welcome Text:       36px / Bold (700)
Subtitle:           16px / Regular (400)
Label:              14px / Medium (500)
Input:              14px / Regular (400)
Button:             16px / Semi-bold (600)
```

## Component Specifications

### Input Fields
- Border Radius: 8px
- Background: #F5F5F5
- Padding: 14px 16px
- Border: None (transparent)
- Focus Border: #FF6B35
- Hover Border: #FF6B35

### Login Button
- Border Radius: 8px
- Background: #FF6B35
- Padding: 14px (vertical)
- Text Color: White
- Hover Background: #FF5722
- Icon: Arrow Forward (→)

### Logo
- Height: 60px (desktop left side)
- Height: 50px (mobile top)
- Height: 45px (sidebar)

### Background Image
- Position: Cover
- Gradient Overlay: rgba(26, 26, 26, 0.7) to rgba(255, 107, 53, 0.3)
- Industrial theme with tanks, pipes, and structures

## Responsive Breakpoints

- **Mobile**: < 900px (md breakpoint)
  - Single column layout
  - Logo at top center
  - Full-width form
  - Background hidden

- **Desktop**: ≥ 900px
  - Split-screen layout
  - Background visible on left
  - Form on right (550px fixed width)
  - Logo on background

## States

### Default State
- Clean, minimal interface
- Placeholder text in inputs
- Orange primary button

### Focus State
- Input border changes to orange
- Smooth transition effect

### Error State
- Red alert banner above form
- Error message displayed
- Input validation

### Loading State
- Button disabled
- Button text changes to "Signing in..."
- Inputs disabled

### Success State
- Redirects to /dashboard
- User data stored in localStorage

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Form validation messages
- Semantic HTML structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- SVG images for scalability
- Lazy loading not needed (login is entry point)
- Optimized image sizes
- Fast initial load
- Smooth transitions (0.2s ease-in-out)

