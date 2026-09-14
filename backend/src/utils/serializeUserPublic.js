export function serializeUserPublic(user = {}) {
  if (!user || typeof user !== 'object') {
    return {};
  }

  const safeUser = {
    id: user.id,
    username: user.username || user.user || user.nombre_usuario,
    email: user.email,
    telefono: user.telefono
  };

  return safeUser;
}
