document.documentElement.classList.add('js-enabled');

const typeTargets = [...document.querySelectorAll('[data-type-line]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const year = document.querySelector('[data-year]');

// Dynamic Current Year
if (year) {
	year.textContent = new Date().getFullYear();
}

// Reveal on Scroll / Intersection Observer
const revealItems = [...document.querySelectorAll('.reveal')];

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
} else {
	revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Typing Terminal Animation
const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const appendPromptPart = (target, className, text) => {
	if (!text) {
		return;
	}

	const span = document.createElement('span');
	span.className = className;
	span.textContent = text;
	target.append(span);
};

const renderTypedLine = (target, text) => {
	if (!target.hasAttribute('data-prompt-line')) {
		target.textContent = text;
		return;
	}

	const promptMatch = target.dataset.typeLine.match(/^([^:]+)(:)(~)(\$)(.*)$/);

	if (!promptMatch) {
		target.textContent = text;
		return;
	}

	const [, user, separator, directory, symbol, command] = promptMatch;
	const parts = [
		['prompt-user', user],
		['prompt-separator', separator],
		['prompt-dir', directory],
		['prompt-symbol', symbol],
		['', command],
	];

	let remaining = text.length;
	target.textContent = '';

	for (const [className, part] of parts) {
		if (remaining <= 0) {
			break;
		}

		const visible = part.slice(0, remaining);
		remaining -= visible.length;

		if (className) {
			appendPromptPart(target, className, visible);
		} else {
			target.append(document.createTextNode(visible));
		}
	}
};

const runTypewriter = async () => {
	if (reducedMotion) {
		typeTargets.forEach((target) => {
			renderTypedLine(target, target.dataset.typeLine);
		});
		typeTargets.at(-1)?.parentElement?.classList.add('is-idle');
		return;
	}

	typeTargets.forEach((target) => {
		target.textContent = '';
		target.parentElement?.classList.remove('is-active', 'is-idle');
	});

	for (const target of typeTargets) {
		const text = target.dataset.typeLine;
		const speed = Number(target.dataset.typeSpeed || 32);
		const pause = Number(target.dataset.typePause || 260);
		const line = target.parentElement;

		line?.classList.add('is-active');
		await wait(220);

		for (let index = 0; index <= text.length; index += 1) {
			renderTypedLine(target, text.slice(0, index));
			await wait(speed);
		}

		line?.classList.remove('is-active');
		await wait(pause);
	}

	await wait(180);
	typeTargets.at(-1)?.parentElement?.classList.add('is-idle');
};

runTypewriter();


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

// Desktop Progressive Morphing Navbar
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
	let ticking = false;

	const updateHeaderProgress = () => {
		const scrollY = window.scrollY;
		let rawProgress = Math.min(Math.max((scrollY - 24) / 56, 0), 1);
		let progress = 1 - Math.pow(1 - rawProgress, 3);
		
		if (reducedMotion) {
			progress = scrollY > 80 ? 1 : 0;
		}

		siteHeader.style.setProperty('--header-progress', progress.toFixed(3));
		ticking = false;
	};

	window.addEventListener('scroll', () => {
		if (!ticking) {
			window.requestAnimationFrame(updateHeaderProgress);
			ticking = true;
		}
	}, { passive: true });

	// Initial evaluation
	updateHeaderProgress();
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

// Focus Cards Interaction Logic
const focusCards = document.querySelectorAll('.focus-card');
if (focusCards.length > 0) {
	const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
	
	if (!isTouchDevice && !reducedMotion) {
		// Desktop pointer tracking for micro-interaction
		focusCards.forEach(card => {
			card.addEventListener('pointermove', (e) => {
				const rect = card.getBoundingClientRect();
				const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
				const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
				
				// Map to px (-8px to 8px max movement)
				card.style.setProperty('--mouse-x', `${(x * 8).toFixed(2)}px`);
				card.style.setProperty('--mouse-y', `${(y * 8).toFixed(2)}px`);
			});
			
			card.addEventListener('pointerleave', () => {
				card.style.setProperty('--mouse-x', '0px');
				card.style.setProperty('--mouse-y', '0px');
			});
		});
	} else {
		// Mobile touch logic to toggle active state
		focusCards.forEach(card => {
			card.addEventListener('click', (e) => {
				if (e.target.tagName.toLowerCase() === 'a') return;
				const isActive = card.classList.contains('is-active');
				focusCards.forEach(c => c.classList.remove('is-active'));
				if (!isActive) card.classList.add('is-active');
			});
		});
		
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.focus-card')) {
				focusCards.forEach(c => c.classList.remove('is-active'));
			}
		});
	}
}

// Premium Scroll Choreography Engine
if (!reducedMotion) {
	const focusSectionEl = document.querySelector('.focus-section');
	const focusCardEls = document.querySelectorAll('.focus-card');
	const approachSectionEl = document.querySelector('.approach-section');
	const approachStepItems = document.querySelectorAll('.approach-step-item');
	const siteFooterEl = document.querySelector('.site-footer');
	const footerBgTextEl = document.querySelector('.footer-bg-text');

	let isChoreographyTicking = false;

	const updateScrollChoreography = () => {
		const vh = window.innerHeight;
		const vw = window.innerWidth;
		const isMobile = vw < 768;

		// 1. FOCUS Cards Artwork Parallax (Desktop: ~14-22px, Mobile: ~7-11px)
		if (focusSectionEl && focusCardEls.length > 0) {
			const rect = focusSectionEl.getBoundingClientRect();
			if (rect.bottom > 0 && rect.top < vh) {
				const rawProgress = (vh - rect.top) / (rect.height + vh);
				const centeredProgress = (Math.min(Math.max(rawProgress, 0), 1) - 0.5) * 2; // -1 to 1

				const speeds = isMobile ? [-8, -11, -7] : [-16, -22, -14];
				focusCardEls.forEach((card, idx) => {
					const speed = speeds[idx % speeds.length];
					const offsetY = (centeredProgress * speed).toFixed(2);
					card.style.setProperty('--artwork-parallax-y', `${offsetY}px`);
				});
			}
		}

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
				const thresholds = isMobile ? [0.06, 0.32, 0.60, 0.86] : [0.05, 0.33, 0.64, 0.88];
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
