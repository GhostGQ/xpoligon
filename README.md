# 🎯 XPoligon Demo

Interactive polygon editor for surveillance cameras

![XPoligon Demo](https://img.shields.io/badge/demo-live-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## 🚀 Demo

[Try it online](https://ghostgq.github.io/xpoligon/)

## 📋 Description

XPoligon Demo is an interactive web application showcasing the capabilities of the XPoligon library. It allows you to create and edit polygons on surveillance camera images.

### ✨ Key Features

- 📐 **Precise positioning** - Relative coordinate system (0-1)
- 🏢 **Workplace linking** - Connect polygons to specific workplaces
- 💾 **Auto-save** - All changes are automatically saved to localStorage
- 🎨 **TypeScript support** - Full API type safety
- 📱 **Responsive design** - Works on all devices
- ⚡ **High performance** - Optimized Canvas rendering

### 🎯 How to use

1. **Creating polygons:**
   - Click on the image to create points
   - Close the polygon by clicking near the first point
   - Right-click on a point to remove it

2. **Editing:**
   - Click on a polygon to select it
   - Drag points to change the shape
   - Press Delete/Backspace to remove selected polygon

3. **Linking workplaces:**
   - Select a polygon by clicking on it
   - Choose a workplace from the panel
   - Changes are saved automatically

## 🛠️ Technologies

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **Rendering:** Canvas API
- **Routing:** React Router v7
- **Build:** Vite 5
- **Deploy:** GitHub Actions + GitHub Pages

## 🏗️ Installation and Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/GhostGQ/xpoligon.git
cd xpoligon

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000/xpoligon/
```

### Production Build

```bash
# Build the project
npm run build

# Preview build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── WelcomePage.tsx  # Welcome page
│   ├── CameraList.tsx   # Camera list
│   └── PolygonEditor.tsx # Polygon editor
├── assets/              # Static files
│   └── camera-test.jpg  # Test camera image
├── index.css           # Global styles
├── App.tsx             # Main component
└── main.tsx            # Entry point
```

## 🚀 Deployment

The project is automatically deployed to GitHub Pages when pushing to the `demo` branch using GitHub Actions.

### GitHub Pages Setup

1. Go to Settings → Pages
2. Select Source: GitHub Actions
3. Workflow will run automatically

## 📦 XPoligon Library

This project demonstrates the capabilities of the [XPoligon](https://www.npmjs.com/package/xpoligon) library:

```bash
npm install xpoligon
```

```tsx
import { PolygonEditorPage } from 'xpoligon';
import 'xpoligon/dist/index.css';

function App() {
  return (
    <PolygonEditorPage
      data={editorData}
      onSave={handleSave}
      onChange={handleChange}
      enableLocalStorage={true}
    />
  );
}
```

## 📄 License

MIT © [GhostGQ](https://github.com/GhostGQ)

## 🤝 Contributing

Pull requests and issues are welcome!

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Made with ❤️ for the developer community