async function submitAuth(event, mode) {
  event.preventDefault();
  const form = new FormData(event.target);
  const errorEl = document.querySelector('#error');

  try {
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    const text = await response.text();
    let payload = {};

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error(
          response.ok
            ? 'Server returned an invalid response.'
            : `API error (${response.status}). Make sure the backend is running and the /api/auth/${mode} route is available.`
        );
      }
    }

    if (!response.ok) throw new Error(payload.error || 'Authentication failed');
    localStorage.setItem('smm_token', payload.token);
    location.href = payload.user.role === 'admin' ? '/admin/index.html' : '/index.html';
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hide');
  }
}
