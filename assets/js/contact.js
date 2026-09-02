document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('contact-form');
	if (!form) return;

	const submitBtn = form.querySelector('.submit-btn');
	const btnText = submitBtn.querySelector('.btn-text');
	const statusMessage = document.getElementById('form-status');

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		// Reset status
		statusMessage.className = 'form-status';
		statusMessage.textContent = '';

		// Disable button and show sending state
		submitBtn.disabled = true;
		const originalText = btnText.textContent;
		btnText.textContent = 'Sending...';

		// Gather data
		const formData = new FormData(form);
		const data = {
			name: formData.get('name'),
			email: formData.get('email'),
			subject: formData.get('subject'),
			message: formData.get('message')
		};

		try {
			// Send request to API
			// Note: We do not include any API tokens here. Authentication/validation 
			// must be handled by the Worker via Origin checks and rate limiting.
			const response = await fetch('https://email.trisf.id/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				throw new Error('Failed to send message. Please try again later.');
			}

			// Success
			statusMessage.textContent = 'Message sent successfully. I will get back to you soon.';
			statusMessage.classList.add('success', 'is-visible');
			form.reset();

		} catch (error) {
			// Error
			console.error('Form submission error:', error);
			statusMessage.textContent = error.message || 'An error occurred while sending your message.';
			statusMessage.classList.add('error', 'is-visible');
		} finally {
			// Restore button state
			submitBtn.disabled = false;
			btnText.textContent = originalText;
		}
	});
});
