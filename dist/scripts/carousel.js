// --- Carousel Logic ---
const track = document.querySelector(".carousel-track");
const nextButton = document.querySelector(".carousel-btn--next");
const prevButton = document.querySelector(".carousel-btn--prev");

if (track && nextButton && prevButton) {
    let currentColumn = 0;

    const getColumnsPerView = () => {
        if (window.innerWidth < 768) return 1;
        return 3;
    };

    const getItemsRows = () => {
        if (window.innerWidth < 768) return 3;
        return 2;
    };

    const updateCarousel = () => {
        const trackContainer = document.querySelector(".carousel-track-container");
        if (!trackContainer) return;

        const colsPerView = getColumnsPerView();
        const percentage = (currentColumn / colsPerView) * 100;
        track.style.transform = `translateX(-${percentage}%)`;
    };

    const getTotalColumns = () => {
        const totalItems = track.children.length;
        const rows = getItemsRows();
        return Math.ceil(totalItems / rows);
    };

    nextButton.addEventListener("click", () => {
        const colsPerView = getColumnsPerView();
        const totalColums = getTotalColumns();

        if (currentColumn + colsPerView < totalColums) {
            currentColumn += colsPerView;
        } else {
            currentColumn = 0;
        }
        updateCarousel();
    });

    prevButton.addEventListener("click", () => {
        const colsPerView = getColumnsPerView();
        const totalColums = getTotalColumns();

        if (currentColumn - colsPerView >= 0) {
            currentColumn -= colsPerView;
        } else {
            const maxPageStart =
                Math.floor((totalColums - 0.1) / colsPerView) * colsPerView;
            currentColumn = maxPageStart;
        }
        updateCarousel();
    });

    window.addEventListener("resize", () => {
        currentColumn = 0;
        updateCarousel();
    });
}
