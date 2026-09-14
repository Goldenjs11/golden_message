import pool from '../config/db.js';
import bcryptjs from 'bcryptjs';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import { enviarMailNotificacionVisualizacionSimple } from '../utils/mail.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontPath = path.join(__dirname, '../fonts/Story_Script/StoryScript-Regular.ttf');

export async function createMessageService({ title, viewsLimit, expiresAt, status, user_id, password, link_song, compartido, startDate, nameQr }) {
  const query = `
    INSERT INTO goldenmessages.messages (title, max_views, expires_at, user_id, estado, password, link_song, compartido, start_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const hashedPassword = await bcryptjs.hash(password || '', 10);
  const { rows } = await pool.query(query, [title, viewsLimit, expiresAt || null, user_id, status, hashedPassword, link_song, compartido, startDate]);
  const message = rows[0];

  const hashedLink = await bcryptjs.hash(message.id.toString(), 10);
  const appUrl = process.env.APP_URL.replace(/\/[^\/]*$/, '');
  const link = `${appUrl}/views_message?id_messagge=${hashedLink}`;

  const qrBase64 = await QRCode.toDataURL(link, {
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  });

  await pool.query(
    `UPDATE goldenmessages.messages SET link = $1, qr_code = $2, hash_link_id = $3 WHERE id = $4`,
    [link, qrBase64, hashedLink, message.id]
  );

  return { message, link, qrUrl: qrBase64 };
}

export async function getMessageStatsService(messageId) {
  const { rows } = await pool.query(
    'SELECT user_id FROM goldenmessages.messages WHERE id = $1',
    [messageId]
  );

  return rows[0] || null;
}
