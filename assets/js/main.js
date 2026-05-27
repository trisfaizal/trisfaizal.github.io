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
			target.textContent = text.slice(0, index);
			await wait(speed);
		}

		line?.classList.remove('is-active');
		await wait(pause);
	}

	await wait(180);
	typeTargets.at(-1)?.parentElement?.classList.add('is-idle');
};

runTypewriter();
