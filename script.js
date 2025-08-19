(function() {
	"use strict";

	// Utilities
	function track(eventName, properties) {
		try {
			if (typeof window.gtag === "function") {
				window.gtag("event", eventName, properties || {});
				return;
			}
			if (Array.isArray(window.dataLayer)) {
				window.dataLayer.push({ event: eventName, ...(properties || {}) });
				return;
			}
		} catch (err) {}
		if (window && window.console) {
			console.log("analytics:", eventName, properties || {});
		}
	}

	function qs(sel, el) { return (el || document).querySelector(sel); }
	function qsa(sel, el) { return Array.from((el || document).querySelectorAll(sel)); }

	// Year in footer
	const yearEl = qs('#year');
	if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

	// Smooth anchor scroll respecting reduced motion
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	qsa('a[href^="#"]').forEach(function(link) {
		link.addEventListener('click', function(e) {
			var targetId = link.getAttribute('href');
			if (!targetId || targetId.length <= 1) return;
			var target = qs(targetId);
			if (!target) return;
			e.preventDefault();
			target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
		});
	});

	// CTA tracking
	qsa('[data-event]').forEach(function(el) {
		el.addEventListener('click', function() {
			var name = el.getAttribute('data-event');
			var section = el.getAttribute('data-section') || 'unknown';
			var text = (el.textContent || el.getAttribute('aria-label') || '').trim();
			track(name, { page_section: section, button_text: text, referral: document.referrer || '' });
		});
	});

	// Newsletter form (placeholder submit)
	var form = qs('#newsletter-form');
	if (form) {
		form.addEventListener('submit', function(e) {
			e.preventDefault();
			var email = qs('#newsletter-email', form).value;
			track('newsletter_submit', { page_section: 'community', status: 'opt_in_pending', email_length: email ? email.length : 0 });
			// Placeholder UX
			form.reset();
			var note = document.createElement('p');
			note.className = 'small';
			note.textContent = 'Check your inbox to confirm subscription.';
			form.appendChild(note);
			setTimeout(function() { note.remove(); }, 6000);
		});
	}

	// Lazy trailer embed on click
	function loadTrailer(container) {
		if (!container) return;
		var embedUrl = container.getAttribute('data-embed-url');
		if (!embedUrl || /\[TRAILER_EMBED_URL\]/.test(embedUrl)) {
			console.warn('Trailer embed URL is not configured.');
			return;
		}
		var iframe = document.createElement('iframe');
		iframe.src = embedUrl;
		iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
		iframe.allowFullscreen = true;
		container.innerHTML = '';
		container.appendChild(iframe);
	}

	var trailerTopBtn = qs('#watch-trailer-top');
	var trailerBtn = qs('#watch-trailer');
	var trailerContainer = qs('.trailer-embed');
	function trailerHandler() {
		track('trailer_play', { page_section: 'trailer', player: 'yt', referral: document.referrer || '' });
		loadTrailer(trailerContainer);
	}
	if (trailerTopBtn) trailerTopBtn.addEventListener('click', trailerHandler);
	if (trailerBtn) trailerBtn.addEventListener('click', trailerHandler);

})();

