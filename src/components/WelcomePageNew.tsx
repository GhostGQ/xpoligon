import React from 'react';
import {useNavigate} from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/cameras');
  };

  return (
    <div className='min-h-screen h-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto'>
      <div className='container mx-auto px-4 py-16'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-[64px] font-bold text-gray-900 mb-4'>
            🎯 XPoligon
          </h1>
          <p className='text-xl md:text-2xl text-gray-600'>
            Интерактивный редактор полигонов для камер наблюдения
          </p>
          <button
            onClick={handleGetStarted}
            className='btn-primary text-lg px-8 py-3 mt-4'
          >
            Начать работу →
          </button>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
          <div className='card p-6'>
            <div className='text-3xl mb-4'>📐</div>
            <h3 className='text-xl font-semibold mb-3 text-gray-900'>
              Точное позиционирование
            </h3>
            <p className='text-gray-600'>
              Относительная система координат (0-1) обеспечивает
              масштабируемость для любых разрешений изображений.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl mb-4'>🏢</div>
            <h3 className='text-xl font-semibold mb-3 text-gray-900'>
              Привязка рабочих мест
            </h3>
            <p className='text-gray-600'>
              Связывайте полигоны с конкретными рабочими местами для удобного
              управления зонами.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl mb-4'>💾</div>
            <h3 className='text-xl font-semibold mb-3 text-gray-900'>
              Автосохранение
            </h3>
            <p className='text-gray-600'>
              Все изменения автоматически сохраняются в localStorage браузера
              без потери данных.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl mb-4'>🎨</div>
            <h3 className='text-xl font-semibold mb-3 text-gray-900'>
              TypeScript
            </h3>
            <p className='text-gray-600'>
              Полная поддержка TypeScript с типизированным API для безопасной
              разработки.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl mb-4'>📱</div>
            <h3 className='text-xl font-semibold mb-3 text-gray-900'>
              Адаптивный дизайн
            </h3>
            <p className='text-gray-600'>
              Интерфейс адаптируется под любые размеры экранов от мобильных до
              десктопных.
            </p>
          </div>

          <div className='card p-6'>
            <div className='text-3xl mb-4'>⚡</div>
            <h3 className='text-xl font-semibold mb-3 text-gray-900'>
              Высокая производительность
            </h3>
            <p className='text-gray-600'>
              Оптимизированный Canvas рендеринг обеспечивает плавную работу с
              большими полигонами.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className='card p-8 mb-16'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center'>
            Как использовать
          </h2>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='text-2xl mb-4'>🖱️</div>
              <h3 className='font-semibold mb-2 text-gray-900'>Создание</h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>Кликайте по изображению для создания точек</li>
                <li>Замыкайте полигон кликом рядом с первой точкой</li>
                <li>Правый клик на точке для её удаления</li>
              </ul>
            </div>

            <div className='text-center'>
              <div className='text-2xl mb-4'>✏️</div>
              <h3 className='font-semibold mb-2 text-gray-900'>
                Редактирование
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>Кликните на полигон для выбора</li>
                <li>Перетаскивайте точки для изменения формы</li>
                <li>Delete/Backspace для удаления</li>
              </ul>
            </div>

            <div className='text-center'>
              <div className='text-2xl mb-4'>🔗</div>
              <h3 className='font-semibold mb-2 text-gray-900'>Привязка</h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>Выберите полигон кликом</li>
                <li>Выберите рабочее место в панели</li>
                <li>Сохранение происходит автоматически</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className='card p-8'>
          <h2 className='text-2xl font-bold text-gray-900 text-center'>
            Техническая информация
          </h2>

          <div className='grid md:grid-cols-2 gap-6 mt-4'>
            <div>
              <h3 className='font-semibold text-gray-900'>🛠️ Технологии</h3>
              <div className='space-y-2 text-sm text-gray-600 mt-3'>
                <div className='flex justify-between'>
                  <span>Frontend:</span>
                  <span>React + TypeScript</span>
                </div>
                <div className='flex justify-between'>
                  <span>Рендеринг:</span>
                  <span>Canvas API</span>
                </div>
                <div className='flex justify-between'>
                  <span>Стилизация:</span>
                  <span>Tailwind CSS</span>
                </div>
                <div className='flex justify-between'>
                  <span>Сборка:</span>
                  <span>Vite</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='font-semibold text-gray-900'>📋 Совместимость</h3>
              <div className='space-y-2 text-sm text-gray-600 mt-3'>
                <div className='flex justify-between'>
                  <span>Браузеры:</span>
                  <span>Chrome, Firefox, Safari, Edge</span>
                </div>
                <div className='flex justify-between'>
                  <span>Node.js:</span>
                  <span>18+ рекомендуется</span>
                </div>
                <div className='flex justify-between'>
                  <span>Хранение:</span>
                  <span>localStorage</span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-center gap-4'>
            <div className='mt-8 text-center'>
              <a
                href='https://github.com/GhostGQ/xpoligon'
                target='_blank'
                rel='noopener noreferrer'
                className='btn-secondary inline-flex items-center gap-2'
              >
                <span>📦</span>
                Исходный код на GitHub
              </a>
            </div>
            <div className='mt-8 text-center'>
              <a
                href='https://www.npmjs.com/package/xpoligon?activeTab=readme'
                target='_blank'
                rel='noopener noreferrer'
                className='btn-secondary inline-flex items-center gap-2'
              >
                <span>👇</span>
                Установить библиотеку NPM
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
