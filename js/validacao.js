/* ══════════════════════════════════════════════════════════════
   Barraca Café — Validação do Formulário de Contacto
   ══════════════════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('form-contacto');
  if (!form) return;

  /* ── Helpers ── */
  const field = id => document.getElementById(id);
  const mark  = (el, ok) => { el.classList.toggle('is-valid', ok); el.classList.toggle('is-invalid', !ok); };
  const clear = el => { el.classList.remove('is-valid', 'is-invalid'); };

  /* ── Validadores ── */
  const validators = {
    nome:     el => el.value.trim().length >= 3,
    email:    el => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
    telefone: el => el.value.trim() === '' || /^[\d\s+\-()]{9,15}$/.test(el.value.trim()),
    assunto:  el => el.value !== '',          /* select — just check something is chosen */
    mensagem: el => el.value.trim().length >= 10,
  };

  /* ── Validação em tempo real ── */
  Object.keys(validators).forEach(id => {
    const el = field(id);
    if (!el) return;

    const validate = () => {
      if (el.value.trim() === '' && id === 'telefone') { clear(el); return; }
      mark(el, validators[id](el));
    };

    /* select fires 'change', text inputs fire 'blur' and 'input' */
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', validate);
    } else {
      el.addEventListener('blur', () => {
        if (el.value.trim() === '' && id !== 'telefone') { mark(el, false); return; }
        if (el.value.trim() === '' && id === 'telefone') { clear(el); return; }
        mark(el, validators[id](el));
      });
      el.addEventListener('input', () => {
        /* Only re-validate live if already in an error state */
        if (el.classList.contains('is-invalid')) mark(el, validators[id](el));
      });
    }
  });

  /* ── Submit ── */
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valido = true;

    Object.keys(validators).forEach(id => {
      const el = field(id);
      if (!el) return;

      /* Telefone is optional — skip if empty */
      if (id === 'telefone' && el.value.trim() === '') {
        clear(el);
        return;
      }

      const ok = validators[id](el);
      mark(el, ok);
      if (!ok) valido = false;
    });

    if (valido) {
      /* Disable button to prevent double-submit */
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A enviar...';

      const templateParams = {
        nome:     field('nome').value,
        email:    field('email').value,
        telefone: field('telefone').value || 'Não fornecido',
        assunto:  field('assunto').value,
        mensagem: field('mensagem').value,
      };

      emailjs.send('service_113a2h7', 'template_n89pcui', templateParams)
        .then(() => {
          form.style.display = 'none';
          const suc = document.getElementById('msg-sucesso');
          suc.style.display = 'block';
          suc.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(error => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
          alert('Ocorreu um erro ao enviar a mensagem. Por favor tente novamente.');
          console.error('EmailJS error:', error);
        });

    } else {
      const primeiro = form.querySelector('.is-invalid');
      if (primeiro) primeiro.focus();
    }
  });

});


