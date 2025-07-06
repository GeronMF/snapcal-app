// Параллакс эффект для hero-bg-parallax и AI-анализа
window.addEventListener('scroll', function() {
    const bg = document.getElementById('parallax-bg');
    if(bg) bg.style.backgroundPosition = `center center`;
    const aiBg = document.getElementById('ai-analyze-bg');
    if(aiBg) aiBg.style.backgroundPosition = `center ${30 + window.scrollY*0.14}px`;
});

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Год в футере
    const yearEl = document.getElementById('current-year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    
    // Гамбургер меню
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Закрытие меню при клике на ссылку
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
    
    // Плавные переходы для якорных ссылок
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Учитываем высоту navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Добавляем обработчики событий для всех изображений
    const clickableImages = document.querySelectorAll('.hero-screenshot, .ai-analyze-screenshot, .app-screenshot');
    clickableImages.forEach(img => {
        img.addEventListener('click', function() {
            openImageModal(this.src);
        });
    });
    
    // Обработчик для закрытия модального окна
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close');
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }
    
    // I18N
    createLangSwitcher();
    const lang = getUserLang();
    applyLandingI18n(lang);
});

// Функции модального окна
function openImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg) {
        modal.style.display = 'block';
        modalImg.src = src;
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Закрытие модального окна по клавише Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeImageModal();
    }
});

// Делаем функции глобальными для совместимости
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

// Slide-in анимация для секций и дочерних элементов — только при скролле
function revealOnScroll() {
    document.querySelectorAll('.slide-in').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight - 80) {
            if (!el.classList.contains('visible')) {
                el.classList.add('visible');
                // Анимация для дочерних элементов с задержкой
                Array.from(el.children).forEach((child, i) => {
                    child.style.transitionDelay = (0.15 * i) + 's';
                    child.classList.add('visible');
                });
            }
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ====== I18N для лендинга ======
function getUserLang() {
    const saved = localStorage.getItem('landing_lang');
    if (saved) return saved;
    const nav = navigator.language || navigator.userLanguage;
    if (!nav) return 'en';
    const code = nav.split('-')[0];
    if (['en','es','pl','ru','uk'].includes(code)) return code;
    return 'en';
}

function setUserLang(lang) {
    localStorage.setItem('landing_lang', lang);
}

function applyLandingI18n(lang) {
    if (!window.LANDING_I18N) {
        console.error('LANDING_I18N not loaded');
        return;
    }
    const dict = window.LANDING_I18N[lang] || window.LANDING_I18N['en'];
    if (!dict) {
        console.error('Language dictionary not found for:', lang);
        return;
    }
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key].replace('{year}', new Date().getFullYear());
    });
    // Установить значение в селекте
    const langSelect = document.querySelector('.lang-select');
    if (langSelect) {
        langSelect.value = lang;
    }
}

function createLangSwitcher() {
    const langs = [
        { code: 'en', label: 'EN' },
        { code: 'es', label: 'ES' },
        { code: 'pl', label: 'PL' },
        { code: 'ru', label: 'RU' },
        { code: 'uk', label: 'UA' }
    ];
    const nav = document.querySelector('.navbar-content');
    if (!nav) return;
    
    // Выпадающий список для всех устройств
    let switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    
    let select = document.createElement('select');
    select.className = 'lang-select';
    select.onchange = (e) => {
        setUserLang(e.target.value);
        applyLandingI18n(e.target.value);
    };
    
    langs.forEach(l => {
        let option = document.createElement('option');
        option.value = l.code;
        option.textContent = l.label;
        select.appendChild(option);
    });
    
    switcher.appendChild(select);
    nav.appendChild(switcher);
} 