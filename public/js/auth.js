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
    location.href = payload.user.role === 'admin' ? '/admin' : '/';
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hide');
  }
}
function togglePassword(button) {
  const input = document.getElementById(button.dataset.passwordToggle);
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  button.textContent = visible ? 'Show' : 'Hide';
  button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
}
function showForgotPassword() {
  const email = document.querySelector('input[name="email"]')?.value.trim();
  const message = email
    ? `Hello, I need help resetting my SMM Vault password. My account email is ${email}.`
    : 'Hello, I need help resetting my SMM Vault password.';
  window.open(`https://t.me/getyourcodes?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}
document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-password-toggle]');
  if (toggle) togglePassword(toggle);
  if (event.target.closest('[data-forgot-password]')) {
    event.preventDefault();
    showForgotPassword();
  }
});
