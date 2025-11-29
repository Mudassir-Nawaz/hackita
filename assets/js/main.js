document.addEventListener("DOMContentLoaded", () => {
  // variable
  const menuToggler = document.querySelector(".menuToggler");
  const menu = document.querySelector(".menu");
  const header = document.querySelector(".header");
  const headerBar = document.querySelector(".headerBar");
  const headerLogo = document.querySelector(".headerLogo");
  const grid = document.getElementById("stats-grid");
  const cards = document.querySelectorAll(".card-spotlight");
  const counters = document.querySelectorAll(".card-spotlight span");

  // Menu toggle function
  menuToggler.addEventListener("click", () => {
    menuToggler.classList.toggle("gap-y-3");
    menuToggler.children[0].classList.toggle("rotate-45");
    menuToggler.children[1].classList.toggle("-rotate-45");

    menu.classList.toggle("translate-x-full");

    document
      .getElementsByTagName("body")[0]
      .classList.toggle("overflow-hidden");
  });

  // header state on scroll
  let isScrolled = false;

  function handleScroll() {
    const shouldBeScrolled = window.scrollY > 0;

    if (shouldBeScrolled === isScrolled) return; // ✅ Prevent useless DOM updates
    isScrolled = shouldBeScrolled;

    header.classList.toggle("header-glass", shouldBeScrolled);
    header.classList.toggle("header-glass", shouldBeScrolled);

    headerBar.classList.toggle("py-5", !shouldBeScrolled);
    headerBar.classList.toggle("py-2", shouldBeScrolled);

    headerLogo.classList.toggle("h-30", !shouldBeScrolled);
    headerLogo.classList.toggle("h-20", shouldBeScrolled);

    menu.classList.toggle("top-30", !shouldBeScrolled);
    menu.classList.toggle("top-23", shouldBeScrolled);
  }

  handleScroll();

  window.addEventListener("scroll", () => {
    requestAnimationFrame(handleScroll);
  });

  // Hero paragraph typewritter
  (function () {
    const words = Array.from(
      document.querySelectorAll("#typewriter-data span")
    ).map((s) => s.textContent.trim());

    const target = document.getElementById("typewriter");
    if (!target || words.length === 0) return;

    let wordIndex = 0;
    let charIndex = 0; // current length of displayed substring
    let isDeleting = false; // typing or deleting
    let pendingPause = false; // used to create a single pause after typing full word

    const TYPING_SPEED = 90; // ms per char when typing
    const DELETING_SPEED = 50; // ms per char when deleting
    const HOLD_AFTER_TYPE = 2200; // show full word this long before starting delete
    const HOLD_AFTER_DELETE = 400; // short pause after delete before next word

    function typeEffect() {
      const currentWord = words[wordIndex];
      let nextDelay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

      if (!isDeleting) {
        // Typing mode
        if (charIndex < currentWord.length) {
          charIndex++;
          target.textContent = currentWord.substring(0, charIndex);
        } else {
          // Fully typed
          if (!pendingPause) {
            // first time we hit full word -> create a single pause
            pendingPause = true;
            nextDelay = HOLD_AFTER_TYPE;
          } else {
            // pause finished -> begin deleting
            pendingPause = false;
            isDeleting = true;
            // start deletion by removing one char immediately on next tick
            if (charIndex > 0) {
              charIndex--;
              target.textContent = currentWord.substring(0, charIndex);
            }
            nextDelay = DELETING_SPEED;
          }
        }
      } else {
        // Deleting mode
        if (charIndex > 0) {
          charIndex--;
          target.textContent = currentWord.substring(0, charIndex);
        } else {
          // Fully deleted -> move to next word
          isDeleting = false;
          pendingPause = false;
          wordIndex = (wordIndex + 1) % words.length;
          nextDelay = HOLD_AFTER_DELETE;
          // charIndex is already 0; next call will start typing new word
        }
      }

      setTimeout(typeEffect, nextDelay);
    }

    // kick off
    typeEffect();
  })();

  // Services cards hover state
  let insideGrid = false;

  // Track GLOBAL mouse inside grid
  grid.addEventListener("mousemove", (e) => {
    const gx = e.clientX;
    const gy = e.clientY;
    insideGrid = true;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();

      // Clamp light position to nearest edge if cursor in gap
      const x = Math.min(Math.max(gx - rect.left, 0), rect.width);
      const y = Math.min(Math.max(gy - rect.top, 0), rect.height);

      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
      card.style.setProperty("--o", `1`);
    });
  });

  // Hide light completely when OUTSIDE grid
  grid.addEventListener("mouseleave", () => {
    insideGrid = false;
    cards.forEach((card) => {
      card.style.setProperty("--o", `0`);
    });
  });

  // Card counter
  counters.forEach((span) => {
    const finalText = span.textContent.trim();
    const isNumber = /^[0-9]+/.test(finalText);
    const duration = 2000; // counter animation duration in ms
    const delay = 800; // delay in ms before animation starts
    let started = false;

    span.textContent = isNumber ? "0" : "";

    const animate = () => {
      if (started) return;
      started = true;

      if (isNumber) {
        // Numeric counter (supports suffix)
        const match = finalText.match(/^(\d+)(.*)$/);
        const target = parseInt(match[1]);
        const suffix = match[2] || "";
        const startTime = performance.now();

        function update(time) {
          const progress = Math.min((time - startTime) / duration, 1);
          const value = Math.floor(progress * target);
          span.textContent = value + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            span.textContent = finalText;
          }
        }

        setTimeout(() => requestAnimationFrame(update), delay);
      } else {
        // Text scramble for letters/words
        const chars = "!<>-_\\/[]{}—=+*^?#________";
        let frame = 0;

        const scramble = () => {
          span.textContent = finalText
            .split("")
            .map((char, i) =>
              i < frame
                ? finalText[i]
                : chars[Math.floor(Math.random() * chars.length)]
            )
            .join("");

          frame++;
          if (frame <= finalText.length) {
            setTimeout(scramble, 30);
          } else {
            span.textContent = finalText;
          }
        };

        setTimeout(scramble, delay);
      }
    };

    // Intersection Observer to trigger animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) animate();
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(span);
  });

  // plugins init
  AOS.init(); // AOS
  // Swiper
  let articleSwiper = new Swiper(".articleSwiper", {
    watchSlidesProgress: true,
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: ".nextArticle",
      prevEl: ".prevArticle",
    },
    breakpoints: {
      620: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
});
