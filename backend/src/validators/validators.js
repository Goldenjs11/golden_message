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

export function validateReactionPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Payload inválido'] };
  }

  const allowed = ['like', 'love', 'smile', 'clap', 'star'];
  if (!payload.reactionType || !allowed.includes(payload.reactionType)) {
    errors.push('reactionType es obligatorio y debe ser uno de like, love, smile, clap o star');
  }

  if (payload.comment && typeof payload.comment === 'string' && payload.comment.trim().length > 1000) {
    errors.push('comment no debe superar 1000 caracteres');
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, errors: [] };
}

export function validateProfileUpdatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Payload inválido'] };
  }

  const profileName = (payload.username_public || '').trim();
  if (!profileName) {
    errors.push('username_public es obligatorio');
  }

  const name = (payload.name || '').trim();
  if (payload.name !== undefined && name.length > 80) {
    errors.push('name no debe superar 80 caracteres');
  }

  const lastName = (payload.last_name || '').trim();
  if (payload.last_name !== undefined && lastName.length > 80) {
    errors.push('last_name no debe superar 80 caracteres');
  }

  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
  if (payload.facebook_link && !urlPattern.test(payload.facebook_link.trim())) {
    errors.push('facebook_link debe tener un formato de URL válido');
  }

  if (payload.instagram_link && !urlPattern.test(payload.instagram_link.trim())) {
    errors.push('instagram_link debe tener un formato de URL válido');
  }

  const share = String(payload.username_public_share ?? '');
  if (payload.username_public_share !== undefined && !['true', 'false'].includes(share)) {
    errors.push('username_public_share debe ser true o false');
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, errors: [] };
}

export function validateMessageFilters(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Payload inválido'] };
  }

  const estado = (payload.estado || '').toLowerCase();
  if (estado && !['activo', 'inactivo', 'privado', 'compartido'].includes(estado)) {
    errors.push('estado debe ser activo, inactivo, privado o compartido');
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (payload.startDate && !datePattern.test(payload.startDate)) {
    errors.push('startDate debe usar formato YYYY-MM-DD');
  }

  if (payload.endDate && !datePattern.test(payload.endDate)) {
    errors.push('endDate debe usar formato YYYY-MM-DD');
  }

  if (payload.startDate && payload.endDate && payload.startDate > payload.endDate) {
    errors.push('startDate no puede ser posterior a endDate');
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, errors: [] };
}
