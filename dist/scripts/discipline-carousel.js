// Discipline Carousel — Circular infinite (3 copies, seamless wrap)
// Drag any number of laps; background transparent

const EASE_SMOOTH = "cubic-bezier(0.33, 1, 0.68, 1)";
const TRANSITION_DURATION = "0.5s";

document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".disc-carousel__track");
    if (!track) return;

    let items = Array.from(track.querySelectorAll(".disc-carousel-card"));
    const container = document.querySelector(".disc-carousel");
    if (!container || items.length === 0) return;

    const contentCards = Array.from(document.querySelectorAll(".disc-content-card"));
    const N = items.length;

    // Triple the list: [ ...originals, ...copy2, ...copy3 ] = 3N items. Middle set N..2N-1 is "home"
    for (let copy = 0; copy < 2; copy++) {
        for (let i = 0; i < N; i++) {
            const clone = items[i].cloneNode(true);
            clone.classList.add("disc-carousel-card--clone");
            track.appendChild(clone);
        }
    }
    items = Array.from(track.querySelectorAll(".disc-carousel-card"));

    const pathId = (window.location.pathname.split("/").pop() || "").replace(/\/$/, "");
    const firstMatch = items.findIndex((el) => el.getAttribute("data-discipline-id") === pathId);
    const logicalFromId = firstMatch >= 0 ? firstMatch % N : 0;
    let physicalIndex = N + logicalFromId;

    function isMobile() {
        return window.innerWidth <= 768;
    }

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function getCardWidth() {
        return container.offsetWidth / 3;
    }

    function getTranslateForPhysicalIndex(idx) {
        const cardWidth = getCardWidth();
        return (1 - idx) * cardWidth;
    }

    function setCardWidths() {
        const cardWidth = getCardWidth();
        items.forEach((item) => {
            item.style.minWidth = cardWidth + "px";
            item.style.maxWidth = cardWidth + "px";
        });
    }

    function physicalToLogical(physical) {
        return ((physical % N) + N) % N;
    }

    // Scale/3D based on distance from center (smooth during drag and snap)
    const SCALE_CENTER = 1.08;
    const SCALE_EDGE = 0.78;
    const ROTATE_EDGE = 24;
    const Z_CENTER = 50;
    const Z_EDGE = -50;

    function updateCardTransforms(translateX) {
        const cardWidth = getCardWidth();
        const centerX = container.offsetWidth / 2;
        items.forEach((item, i) => {
            const cardCenterX = i * cardWidth + translateX + cardWidth / 2;
            const distanceFromCenter = cardCenterX - centerX;
            const t = Math.min(1, Math.abs(distanceFromCenter) / cardWidth);
            const sign = distanceFromCenter >= 0 ? 1 : -1;
            const scale = SCALE_CENTER - t * (SCALE_CENTER - SCALE_EDGE);
            const rotateY = sign * ROTATE_EDGE * t;
            const z = Z_CENTER - t * (Z_CENTER - Z_EDGE);
            item.style.transform = `rotateY(${rotateY}deg) translateZ(${z}px) scale(${scale})`;
        });
    }

    function updateCardPositions() {
        items.forEach((item, i) => {
            const isCenter = i === physicalIndex;
            item.classList.toggle("disc-carousel-card--active", isCenter);
            const pos = i < physicalIndex ? "left" : i > physicalIndex ? "right" : "center";
            item.setAttribute("data-position", pos);
        });
        updateCardTransforms(currentTranslate);
    }

    function changeContentCard(logicalIndex) {
        const el = items[N + logicalIndex];
        const disciplineId = el ? el.getAttribute("data-discipline-id") : null;
        if (!disciplineId) return;

        contentCards.forEach((card) => card.classList.remove("disc-content-card--active"));
        const targetCard = contentCards.find(
            (card) => card.getAttribute("data-discipline-id") === disciplineId
        );
        if (targetCard) targetCard.classList.add("disc-content-card--active");

        const newPath = `/disciplinas/${disciplineId}`;
        if (window.location.pathname !== newPath) {
            window.history.pushState({ disciplineId }, "", newPath);
        }
    }

    function applyCircularJump() {
        const cardWidth = getCardWidth();
        if (physicalIndex < N) {
            currentTranslate -= N * cardWidth;
            prevTranslate = currentTranslate;
            physicalIndex += N;
            setTransition(false);
            track.style.transform = `translateX(${currentTranslate}px)`;
            requestAnimationFrame(() => setTransition(true));
        } else if (physicalIndex >= 2 * N) {
            currentTranslate += N * cardWidth;
            prevTranslate = currentTranslate;
            physicalIndex -= N;
            setTransition(false);
            track.style.transform = `translateX(${currentTranslate}px)`;
            requestAnimationFrame(() => setTransition(true));
        }
    }

    function getTrackTranslateX() {
        const t = getComputedStyle(track).transform;
        if (!t || t === "none") return 0;
        const m = t.match(/matrix(?:3d)?\(([^)]+)\)/);
        if (!m) return 0;
        const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
        if (parts.length >= 16) return parts[12];
        if (parts.length >= 6) return parts[4];
        return 0;
    }

    function snapToNearest() {
        const cardWidth = getCardWidth();
        const targetPhysical = Math.round(-(currentTranslate - cardWidth) / cardWidth);
        let newPhysical = Math.max(0, Math.min(targetPhysical, items.length - 1));

        physicalIndex = newPhysical;
        const snapTranslate = getTranslateForPhysicalIndex(physicalIndex);
        currentTranslate = snapTranslate;
        prevTranslate = snapTranslate;

        track.style.transition = `transform ${TRANSITION_DURATION} ${EASE_SMOOTH}`;
        track.style.transform = `translateX(${snapTranslate}px)`;

        updateCardPositions();
        const logical = physicalToLogical(physicalIndex);
        changeContentCard(logical);

        track.classList.add("disc-carousel__track--dynamic");
        const cancelFollow = followTrackTransition(520);
        setTimeout(() => {
            cancelFollow();
            applyCircularJump();
            updateCardTransforms(currentTranslate);
            updateCardPositions();
            track.classList.remove("disc-carousel__track--dynamic");
        }, 520);
    }

    function setTransition(enabled) {
        track.style.transition = enabled ? `transform ${TRANSITION_DURATION} ${EASE_SMOOTH}` : "none";
    }

    function setPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
        updateCardTransforms(currentTranslate);
    }

    function onPointerDown(e) {
        isDragging = true;
        startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        setTransition(false);
        track.classList.add("disc-carousel__track--dynamic");
        track.style.cursor = "grabbing";
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        setPosition();
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = "grab";
        snapToNearest();
    }

    function followTrackTransition(durationMs) {
        const startTime = performance.now();
        let rafId;
        function tick() {
            const elapsed = performance.now() - startTime;
            updateCardTransforms(getTrackTranslateX());
            if (elapsed < durationMs) rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }

    items.forEach((item, index) => {
        item.addEventListener("click", (e) => {
            if (isDragging) return;

            const logical = index % N;
            const targetPhysical = N + logical;
            if (targetPhysical === physicalIndex) return;

            physicalIndex = targetPhysical;
            const snapTranslate = getTranslateForPhysicalIndex(physicalIndex);
            currentTranslate = snapTranslate;
            prevTranslate = snapTranslate;

            track.style.transition = `transform ${TRANSITION_DURATION} ${EASE_SMOOTH}`;
            track.style.transform = `translateX(${snapTranslate}px)`;

            updateCardPositions();
            changeContentCard(logical);

            track.classList.add("disc-carousel__track--dynamic");
            const cancelFollow = followTrackTransition(520);
            setTimeout(() => {
                cancelFollow();
                track.classList.remove("disc-carousel__track--dynamic");
            }, 520);
        });
        item.addEventListener("dragstart", (e) => e.preventDefault());
    });

    function handleMobileCarouselPosition() {
        if (!isMobile()) return;
        const footer = document.querySelector("footer");
        if (!footer) return;
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (footerRect.top < viewportHeight && footerRect.top > 0) {
            container.classList.add("sticky-top");
        } else {
            container.classList.remove("sticky-top");
        }
    }

    if (isMobile()) {
        let scrollTimeout;
        window.addEventListener("scroll", () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleMobileCarouselPosition, 10);
        });
        handleMobileCarouselPosition();
    }

    window.addEventListener("popstate", () => {
        const pathId = window.location.pathname.split("/").pop();
        const idx = items.findIndex((el) => el.getAttribute("data-discipline-id") === pathId);
        if (idx < 0) return;
        const logical = idx % N;
        const newPhysical = N + logical;
        if (newPhysical === physicalIndex) return;
        physicalIndex = newPhysical;
        const snapTranslate = getTranslateForPhysicalIndex(physicalIndex);
        currentTranslate = snapTranslate;
        prevTranslate = snapTranslate;
        track.style.transition = `transform ${TRANSITION_DURATION} ${EASE_SMOOTH}`;
        track.style.transform = `translateX(${snapTranslate}px)`;
        updateCardPositions();
        changeContentCard(logical);
    });

    setCardWidths();
    updateCardPositions();
    currentTranslate = getTranslateForPhysicalIndex(physicalIndex);
    prevTranslate = currentTranslate;
    track.style.transition = `transform ${TRANSITION_DURATION} ${EASE_SMOOTH}`;
    track.style.transform = `translateX(${currentTranslate}px)`;

    track.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    track.addEventListener("touchstart", onPointerDown, { passive: true });
    track.addEventListener("touchmove", onPointerMove, { passive: false });
    track.addEventListener("touchend", onPointerUp);

    window.addEventListener("resize", () => {
        setCardWidths();
        currentTranslate = getTranslateForPhysicalIndex(physicalIndex);
        prevTranslate = currentTranslate;
        setTransition(false);
        track.style.transform = `translateX(${currentTranslate}px)`;
        updateCardTransforms(currentTranslate);
        if (isMobile() !== (window.innerWidth <= 768)) location.reload();
    });
});
