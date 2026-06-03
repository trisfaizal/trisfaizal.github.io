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

// Mobile Menu Toggle logic
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (mobileMenuToggle && mobileNav) {
	const closeMenu = () => {
		mobileMenuToggle.setAttribute('aria-expanded', 'false');
		mobileNav.classList.remove('is-open');
	};

	mobileMenuToggle.addEventListener('click', (event) => {
		event.stopPropagation();
		const expanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
		mobileMenuToggle.setAttribute('aria-expanded', !expanded);
		mobileNav.classList.toggle('is-open');
	});

	// Close menu if clicking outside
	document.addEventListener('click', (event) => {
		if (!mobileNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
			closeMenu();
		}
	});

	// Close menu when selecting a menu item
	mobileNav.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => {
			closeMenu();
		});
	});
}
