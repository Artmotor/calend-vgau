document.addEventListener('DOMContentLoaded', function() {
    const sliderTrack = document.querySelector('.slider-track');
    const sliderItems = document.querySelectorAll('.slider-item');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const sliderContainer = document.querySelector('.slider-container');
    
    let currentIndex = 0;
    const itemWidth = sliderItems[0].offsetWidth;
    const gap = 30;
    let visibleItems = 3;
    
    function updateVisibleItems() {
        const containerWidth = sliderContainer.offsetWidth;
        visibleItems = Math.floor(containerWidth / (itemWidth + gap));
        visibleItems = Math.min(3, Math.max(1, visibleItems)); // Ограничиваем от 1 до 3
    }
    
    function updateSlider() {
        const offset = -currentIndex * (itemWidth + gap);
        sliderTrack.style.transform = `translateX(${offset}px)`;
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= sliderItems.length - visibleItems;
    }
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex < sliderItems.length - visibleItems) {
            currentIndex++;
            updateSlider();
        }
    });
    
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });
    
    // Инициализация
    updateVisibleItems();
    updateSlider();
    
    // Адаптация при изменении размера окна
    window.addEventListener('resize', function() {
        updateVisibleItems();
        updateSlider();
    });
});