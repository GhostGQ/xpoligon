# 🎯 XPoligon Demo

Интерактивный редактор полигонов для камер наблюдения

![XPoligon Demo](https://img.shields.io/badge/demo-live-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## 🚀 Демо

[Попробовать online](https://ghostgq.github.io/xpoligon/)

## 📋 Описание

XPoligon Demo - это интерактивное веб-приложение для демонстрации возможностей библиотеки XPoligon. Позволяет создавать и редактировать полигоны на изображениях камер наблюдения.

### ✨ Основные возможности

- 📐 **Точное позиционирование** - Относительная система координат (0-1)
- 🏢 **Привязка рабочих мест** - Связывание полигонов с рабочими местами
- 💾 **Автосохранение** - Все изменения сохраняются в localStorage
- 🎨 **TypeScript поддержка** - Полная типизация API
- 📱 **Адаптивный дизайн** - Работает на всех устройствах
- ⚡ **Высокая производительность** - Оптимизированный Canvas рендеринг

### 🎯 Как использовать

1. **Создание полигонов:**
   - Кликайте по изображению для создания точек
   - Замыкайте полигон кликом рядом с первой точкой
   - Правый клик на точке для её удаления

2. **Редактирование:**
   - Кликните на полигон для выбора
   - Перетаскивайте точки для изменения формы
   - Delete/Backspace для удаления

3. **Привязка рабочих мест:**
   - Выберите полигон кликом
   - Выберите рабочее место в панели
   - Сохранение происходит автоматически

## 🛠️ Технологии

- **Frontend:** React 18 + TypeScript
- **Стилизация:** Tailwind CSS v4
- **Рендеринг:** Canvas API
- **Роутинг:** React Router v7
- **Сборка:** Vite 5
- **Деплой:** GitHub Actions + GitHub Pages

## 🏗️ Установка и запуск

### Предварительные требования

- Node.js 18+ 
- npm или yarn

### Локальная разработка

```bash
# Клонировать репозиторий
git clone https://github.com/GhostGQ/xpoligon.git
cd xpoligon

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Открыть http://localhost:3000/xpoligon/
```

### Сборка для продакшена

```bash
# Собрать проект
npm run build

# Предварительный просмотр
npm run preview
```

## 📁 Структура проекта

```
src/
├── components/           # React компоненты
│   ├── WelcomePage.tsx  # Приветственная страница
│   ├── CameraList.tsx   # Список камер
│   └── PolygonEditor.tsx # Редактор полигонов
├── assets/              # Статические файлы
│   └── camera-test.jpg  # Тестовое изображение камеры
├── index.css           # Глобальные стили
├── App.tsx             # Главный компонент
└── main.tsx            # Точка входа
```

## 🚀 Деплой

Проект автоматически деплоится на GitHub Pages при пуше в ветку `demo` с помощью GitHub Actions.

### Настройка GitHub Pages

1. Перейдите в Settings → Pages
2. Выберите Source: GitHub Actions
3. Workflow будет запускаться автоматически

## 📦 Библиотека XPoligon

Этот проект демонстрирует возможности библиотеки [XPoligon](https://www.npmjs.com/package/xpoligon):

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

## 📄 Лицензия

MIT © [GhostGQ](https://github.com/GhostGQ)

## 🤝 Вклад в проект

Приветствуются pull requests и issues!

1. Fork проект
2. Создайте feature ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

Сделано с ❤️ для сообщества разработчиков