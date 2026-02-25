// Observer para detectar cuando las features están en el centro de la pantalla (móvil y desktop)
const features = document.querySelectorAll(".feature");

if (features.length > 0) {
    const observer = new IntersectionObserver(
        (entries) => {
            const isMobile = window.innerWidth < 768;

            entries.forEach((entry) => {
                if (!isMobile) {
                    entry.target.classList.remove("is-focused");
                    return;
                }

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-focused");
                } else {
                    entry.target.classList.remove("is-focused");
                }
            });
        },
        {
            root: null,
            rootMargin: "-40% 0px -40% 0px",
            threshold: 0,
        },
    );

    features.forEach((feature) => observer.observe(feature));
}
