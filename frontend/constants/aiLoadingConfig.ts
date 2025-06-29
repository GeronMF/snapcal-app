export const AI_LOADING_CONFIG = {
  // Время до разрешения закрытия модального окна (мс)
  CLOSE_DELAY: 3000,
  
  // Настройки анимации точек
  DOT_ANIMATION: {
    DURATION: 600,
    DELAY_BETWEEN_DOTS: 200,
    MIN_OPACITY: 0.3,
    MAX_OPACITY: 1,
  },
  
  // Размеры модального окна (в процентах от экрана)
  MODAL_SIZE: {
    WIDTH_PERCENT: 0.9,
    HEIGHT_PERCENT: 0.7,
  },
  
  // Размеры превью изображения
  IMAGE_PREVIEW: {
    SIZE: 80,
    BORDER_RADIUS: 12,
    BORDER_WIDTH: 2,
  },
  
  // Тексты подсказок
  HINTS: {
    CLOSE_HINT: 'Нажмите, чтобы закрыть',
    LOADING_HINT: 'Анализируем ваше изображение...',
  },
  
  // Цвета
  COLORS: {
    OVERLAY: 'rgba(0, 0, 0, 0.4)',
    TEXT_OVERLAY: 'rgba(0, 0, 0, 0.8)',
    HINT_TEXT: 'rgba(255, 255, 255, 0.7)',
    PREVIEW_BORDER: 'rgba(255, 255, 255, 0.3)',
    PREVIEW_BACKGROUND: 'rgba(0, 0, 0, 0.3)',
  },
}; 