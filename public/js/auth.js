async function submitAuth(event, mode) {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    const data = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    }).then(async (r) => {
      const x = await r.json();
      if (!r.ok) throw Error(x.error);
      return x;
    });
    localStorage.setItem('smm_token', data.token);
    location.href = data.user.role === 'admin' ? '/admin/index.html' : '/index.html';
  } catch (e) {
    document.querySelector('#error').textContent = e.message;
    document.querySelector('#error').classList.remove('hide');
  }
}
