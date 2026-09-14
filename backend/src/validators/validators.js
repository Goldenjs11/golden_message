export function validateRegistration(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Payload inválido'] };
  }

  if (!payload.email || !payload.email.includes('@')) {
    errors.push('email es obligatorio y debe tener un formato válido');
  }

  if (!payload.user || payload.user.trim().length < 3) {
    errors.push('user es obligatorio y debe tener al menos 3 caracteres');
  }

  if (!payload.password || payload.password.length < 6) {
    errors.push('password es obligatorio y debe tener al menos 6 caracteres');
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, errors: [] };
}

export function validateLogin(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Payload inválido'] };
  }

  if (!payload.username || payload.username.trim().length < 3) {
    errors.push('username es obligatorio');
  }

  if (!payload.password || payload.password.length < 6) {
    errors.push('password es obligatorio y debe tener al menos 6 caracteres');
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, errors: [] };
}

export function validateMessagePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Payload inválido'] };
  }

  if (!payload.title || payload.title.trim().length < 2) {
    errors.push('title es obligatorio');
  }

  if (!payload.user_id) {
    errors.push('user_id es obligatorio');
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, errors: [] };
}
