const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const typeTargets = [...document.querySelectorAll('[data-type-line]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const year = document.querySelector('[data-year]');

if (year) {
	year.textContent = new Date().getFullYear();
}

const setHeaderState = () => {
	header?.classList.toggle('is-scrolled', window.scrollY > 16);
};

navToggle?.addEventListener('click', () => {
	const expanded = navToggle.getAttribute('aria-expanded') === 'true';
	navToggle.setAttribute('aria-expanded', String(!expanded));
	navMenu?.classList.toggle('is-open', !expanded);
});

navMenu?.addEventListener('click', (event) => {
	if (event.target instanceof HTMLAnchorElement) {
		navToggle?.setAttribute('aria-expanded', 'false');
		navMenu.classList.remove('is-open');
	}
});

window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();

const revealItems = [...document.querySelectorAll('.reveal')];

if ('IntersectionObserver' in window && !reducedMotion) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.16 });

	revealItems.forEach((item) => observer.observe(item));
} else {
	revealItems.forEach((item) => item.classList.add('is-visible'));
}

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const runTypewriter = async () => {
	if (reducedMotion) {
		typeTargets.forEach((target) => {
			target.textContent = target.dataset.typeLine;
		});
		return;
	}

	typeTargets.forEach((target) => {
		target.textContent = '';
	});

	for (const target of typeTargets) {
		const text = target.dataset.typeLine;
		await wait(340);

		for (let index = 0; index <= text.length; index += 1) {
			target.textContent = text.slice(0, index);
			await wait(38);
		}

		await wait(120);
	}
};

runTypewriter();
