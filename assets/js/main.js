document.documentElement.classList.add('js-enabled');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const year = document.querySelector('[data-year]');

// Dynamic Current Year
if (year) {
	year.textContent = new Date().getFullYear();
}

// Reveal on Scroll / Intersection Observer
const revealItems = [...document.querySelectorAll('.reveal')];
const approachTimeline = document.querySelector('.approach-timeline-container');

if ('IntersectionObserver' in window && !reducedMotion) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.1 });

	revealItems.forEach((item) => observer.observe(item));

	const sectionObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				sectionObserver.unobserve(entry.target);
			}
		});
	}, { threshold: 0.15 });

	if (approachTimeline) sectionObserver.observe(approachTimeline);

	// Hero Scroll Cue Observer (fades out cue when scrolling past Hero)
	const heroEl = document.querySelector('.hero');
	const heroScrollCue = document.querySelector('.hero-scroll-cue');
	if (heroEl && heroScrollCue) {
		const heroCueObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
					heroScrollCue.classList.remove('is-hidden');
				} else {
					heroScrollCue.classList.add('is-hidden');
				}
			});
		}, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0] });

		heroCueObserver.observe(heroEl);
	}
} else {
	revealItems.forEach((item) => item.classList.add('is-visible'));
	if (approachTimeline) {
		approachTimeline.classList.add('is-visible');
	}
}

// Theme Toggle Functionality
const themeToggleButtons = document.querySelectorAll('.theme-toggle');

const getPreferredTheme = () => {
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme) {
		return savedTheme;
	}
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const setTheme = (theme) => {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
	
	themeToggleButtons.forEach(button => {
		button.innerHTML = theme === 'dark' ? `
			<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
		` : `
			<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
		`;
	});
};

// Initialize theme switcher UI state
const activeTheme = getPreferredTheme();
setTheme(activeTheme);

// Handle toggle click
themeToggleButtons.forEach(button => {
	button.addEventListener('click', () => {
		const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
	});
});

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const primaryMenu = document.getElementById('primary-menu');

if (mobileMenuToggle && primaryMenu) {
	mobileMenuToggle.addEventListener('click', () => {
		const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
		mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
		primaryMenu.classList.toggle('is-open');
	});
	
		// Close menu when clicking a link
	primaryMenu.addEventListener('click', (e) => {
		if (e.target.tagName.toLowerCase() === 'a') {
			mobileMenuToggle.setAttribute('aria-expanded', 'false');
			primaryMenu.classList.remove('is-open');
		}
	});

	// Close menu on Escape
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && primaryMenu.classList.contains('is-open')) {
			mobileMenuToggle.setAttribute('aria-expanded', 'false');
			primaryMenu.classList.remove('is-open');
			mobileMenuToggle.focus();
		}
	});
}

// Desktop & Mobile Scroll Transforming Navbar
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
	let ticking = false;

	const checkScroll = () => {
		if (window.scrollY > 50) {
			siteHeader.classList.add('is-scrolled');
		} else {
			siteHeader.classList.remove('is-scrolled');
		}
		ticking = false;
	};

	window.addEventListener('scroll', () => {
		if (!ticking) {
			window.requestAnimationFrame(checkScroll);
			ticking = true;
		}
	}, { passive: true });

	// Initial evaluation
	checkScroll();
}

// Interactive Ambient Background System
const ambientBg = document.querySelector('.ambient-background');
if (ambientBg) {
	const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
	
	if (!reducedMotion) {
		let currentX = 0;
		let currentY = 0;
		let targetX = 0;
		let targetY = 0;
		let currentScroll = window.scrollY;
		let targetScroll = window.scrollY;
		let bgTicking = false;

		// Only bind pointermove on non-touch devices
		if (!isTouchDevice) {
			window.addEventListener('pointermove', (e) => {
				// Normalize to -1 to 1
				targetX = (e.clientX / window.innerWidth) * 2 - 1;
				targetY = (e.clientY / window.innerHeight) * 2 - 1;
				
				if (!bgTicking) {
					bgTicking = true;
					window.requestAnimationFrame(updateAmbient);
				}
			}, { passive: true });
		}

		window.addEventListener('scroll', () => {
			targetScroll = window.scrollY;
			if (!bgTicking) {
				bgTicking = true;
				window.requestAnimationFrame(updateAmbient);
			}
		}, { passive: true });

		const updateAmbient = () => {
			// Lerp coordinates (5% each frame for smooth subtle trailing)
			currentX += (targetX - currentX) * 0.05;
			currentY += (targetY - currentY) * 0.05;
			
			// Lerp scroll
			currentScroll += (targetScroll - currentScroll) * 0.1;

			// Map normalized values to subtle pixel shifts (max 100px)
			// Apply a slight upward parallax based on scroll
			const moveX = currentX * 100;
			const moveY = (currentY * 100) - (currentScroll * 0.15);

			ambientBg.style.setProperty('--bg-x', `${moveX.toFixed(2)}px`);
			ambientBg.style.setProperty('--bg-y', `${moveY.toFixed(2)}px`);

			// Continue looping if we haven't reached the target
			const distanceX = Math.abs(targetX - currentX);
			const distanceY = Math.abs(targetY - currentY);
			const distanceScroll = Math.abs(targetScroll - currentScroll);

			if (distanceX > 0.001 || distanceY > 0.001 || distanceScroll > 0.5) {
				window.requestAnimationFrame(updateAmbient);
			} else {
				bgTicking = false;
			}
		};

		// Initial render
		bgTicking = true;
		updateAmbient();
	}
}


// Premium Scroll Choreography Engine
if (!reducedMotion) {
	const approachSectionEl = document.querySelector('.approach-section');
	const approachStepItems = document.querySelectorAll('.approach-step-item');
	const siteFooterEl = document.querySelector('.site-footer');
	const footerBgTextEl = document.querySelector('.footer-bg-text');

	let isChoreographyTicking = false;

	const updateScrollChoreography = () => {
		const vh = window.innerHeight;
		const vw = window.innerWidth;

		// 1. (Focus choreography removed — editorial layout is static)

		// 2. APPROACH Timeline Scroll Progress & Step Activation
		if (approachSectionEl) {
			const rect = approachSectionEl.getBoundingClientRect();
			if (rect.bottom > 0 && rect.top < vh) {
				// Calculate progress ratio (0 to 1) as timeline passes through reading viewport range
				const totalRange = rect.height + vh * 0.45;
				const currentPos = vh * 0.72 - rect.top;
				const progress = Math.min(Math.max(currentPos / totalRange, 0), 1);

				approachSectionEl.style.setProperty('--approach-progress', progress.toFixed(3));

				// Step Point Activations (Reversible on scroll up)
				const isVerticalTimeline = vw <= 1024;
				const thresholds = isVerticalTimeline ? [0.01, 0.27, 0.53, 0.79] : [0.05, 0.33, 0.64, 0.88];
				approachStepItems.forEach((item, idx) => {
					const targetThreshold = thresholds[idx] || (idx * 0.28);
					if (progress >= targetThreshold) {
						item.classList.add('is-active');
					} else {
						item.classList.remove('is-active');
					}
				});
			}
		}

		// 3. FOOTER Typography Parallax (Max 24px)
		if (siteFooterEl && footerBgTextEl) {
			const rect = siteFooterEl.getBoundingClientRect();
			if (rect.bottom > 0 && rect.top < vh) {
				const progress = Math.min(Math.max((vh - rect.top) / (rect.height + vh), 0), 1);
				const offsetY = ((0.5 - progress) * 24).toFixed(2);
				footerBgTextEl.style.setProperty('--footer-parallax-y', `${offsetY}px`);
			}
		}

		isChoreographyTicking = false;
	};

	window.addEventListener('scroll', () => {
		if (!isChoreographyTicking) {
			isChoreographyTicking = true;
			window.requestAnimationFrame(updateScrollChoreography);
		}
	}, { passive: true });

	// Initial evaluation
	updateScrollChoreography();
}
