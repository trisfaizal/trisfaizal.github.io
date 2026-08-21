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
	const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const updateHeaderProgress = () => {
		const scrollY = window.scrollY;
		let rawProgress = Math.min(Math.max((scrollY - 24) / 56, 0), 1);
		let progress = 1 - Math.pow(1 - rawProgress, 3);
		
		if (isReducedMotion) {
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

