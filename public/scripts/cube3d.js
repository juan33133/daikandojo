// Interacción con el cubo 3D con inercia
const cubeContainer = document.querySelector(".mini-cube-container");
const cube = cubeContainer?.querySelector(".mini-cube");

if (cubeContainer && cube) {
    let isDragging = false;
    let startX = 0,
        startY = 0;
    let rotX = -15,
        rotY = 25;
    let velocityX = 0,
        velocityY = 0;
    let animationId = null;
    const baseSpeed = 0.3;

    function animate() {
        if (!isDragging) {
            if (Math.abs(velocityY) < baseSpeed) {
                velocityY = baseSpeed;
            }
            rotY += velocityY;
            rotX += velocityX;
            velocityX *= 0.98;
            velocityY *= 0.995;
            cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            animationId = requestAnimationFrame(animate);
        }
    }

    animate();

    cubeContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        cube.style.animation = "none";
        if (animationId) cancelAnimationFrame(animationId);
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        velocityY = deltaX * 0.5;
        velocityX = -deltaY * 0.5;
        rotY += velocityY;
        rotX += velocityX;
        cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        startX = e.clientX;
        startY = e.clientY;
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            animate();
        }
    });

    // Touch events
    cubeContainer.addEventListener("touchstart", (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        cube.style.animation = "none";
        if (animationId) cancelAnimationFrame(animationId);
    });

    cubeContainer.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        velocityY = deltaX * 0.5;
        velocityX = -deltaY * 0.5;
        rotY += velocityY;
        rotX += velocityX;
        cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    cubeContainer.addEventListener("touchend", () => {
        if (isDragging) {
            isDragging = false;
            animate();
        }
    });
}
