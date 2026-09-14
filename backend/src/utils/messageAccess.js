export function isMessageExpired(message) {
  if (!message || !message.expires_at) {
    return false;
  }

  const expiresAt = new Date(message.expires_at);
  if (Number.isNaN(expiresAt.getTime())) {
    return false;
  }

  return expiresAt.getTime() <= Date.now();
}
