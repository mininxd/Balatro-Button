# Balatro Shader

A WebGL-powered animated flame shader effect inspired by Balatro's visual style. Creates dynamic flame buttons with customizable colors and effects.

# Requirements
This package requires __Tailwind CSS__ to be installed and configured in your project.


## Installation

```bash
npm install balatrobutton
```

## Quick Start

```html
<!-- Add buttons with the flame class -->
<button class="btn-flame">Score: 0</button>
<button class="btn-flame">Multiplier: 1x</button>
```

```javascript
import FlameButton from 'balatrobutton';

// Create flame effects for all buttons
const flameButtons = new FlameButton();

// Or with custom options
const flameButtons = new FlameButton({
  selector: '.my-flame-buttons',
  colorStart: '#ff0000',
  colorMid: '#ff5500',
  colorEnd: '#ffff00',
  power: () => 750,
  score: 100
});
```

## Options

All options are optional and have sensible defaults:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selector` | string | `'.btn-flame'` | CSS selector for buttons to enhance |
| `duration` | number | `0` | Animation duration (0 = infinite) |
| `power` | function | `() => 500` | Function returning flame intensity |
| `score` | number | `0` | Initial score value |
| `colorStart` | string | `'#f00'` | Starting flame color (hex) |
| `colorMid` | string | `'#f50'` | Middle flame color (hex) |
| `colorEnd` | string | `'#ff0'` | End flame color (hex) |

## API Reference

### Constructor

```javascript
new FlameButton(options)
```

Creates flame effects for all elements matching the selector.

### Methods

#### `setScore(score, power)`
Updates the score and optionally the flame power for the first button instance.

```javascript
flameButtons.setScore(50);        // Add 50 to current score
flameButtons.setScore(100, 1000); // Add 100 to score and set power to 1000
```

#### `stopAll()`
Stops all flame animations.

```javascript
flameButtons.stopAll();
```

#### `getColors()`
Returns current color values for all flame instances.

```javascript
const colors = flameButtons.getColors();
console.log(colors); // Array of color objects
```

## Examples

### Basic Usage

```javascript
import FlameButton from 'balatrobutton';
const flames = new FlameButton();
```

### Custom Colors

```javascript
const flames = new FlameButton({
  selector: '.my-buttons',
  colorStart: '#4f46e5',  // Indigo
  colorMid: '#7c3aed',    // Purple
  colorEnd: '#ec4899'     // Pink
});
```

### Dynamic Score Updates

```javascript
const flames = new FlameButton({
  score: 0,
  power: () => Math.random() * 1000
});

// Update score when player scores points
function addScore(points) {
  flames.setScore(points, points * 10);
}
```

### Multiple Button Sets

```javascript
// Create different flame effects for different button types
const scoreButtons = new FlameButton({
  selector: '.score-btn',
  colorStart: '#22c55e',
  colorEnd: '#16a34a'
});

const multiplierButtons = new FlameButton({
  selector: '.multiplier-btn',
  colorStart: '#f59e0b',
  colorEnd: '#d97706'
});
```

## Styling

The package includes custom CSS classes and uses the m6x11plus font for authentic Balatro styling:

```css
.flame-wrapper {
  /* Container for flame effect */
}

.flame-canvas {
  /* WebGL canvas for flame rendering */
}
```

## Color Formats

Colors can be specified in multiple formats:

```javascript
// Hex colors
colorStart: '#ff0000'
colorStart: '#f00'

// RGB colors  
colorStart: 'rgb(255, 0, 0)'
colorStart: 'rgba(255, 0, 0, 0.8)'
```

## Utility Functions

The package also exports utility functions:

```javascript
import FlameButton, { hexToVec4 } from 'balatrobutton';

// Convert hex/rgb to vec4 for WebGL
const color = hexToVec4('#ff5500');
console.log(color); // [1.0, 0.33, 0.0, 1.0]
```

## Browser Support

- Modern browsers with WebGL support
- Chrome 56+
- Firefox 51+
- Safari 10.1+
- Edge 79+

## Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Build JavaScript only
npm run build:js

# Build CSS only
npm run build:css
```

## File Structure

```
balatrobutton/
├── src/
│   ├── main.js          # Main FlameButton class
│   ├── effect.js        # WebGL flame effect
│   ├── style.css        # Styling
│   ├── shaders/
│   │   └── flame.fs     # Fragment shader
│   └── fonts/
│       ├── m6x11plus.woff
│       └── m6x11plus.woff2
└── dist/
    └── balatro-shader.min.js
```

## License

Proprietary

## Contributing

Issues and feature requests are welcome! Please check the existing issues before creating new ones.