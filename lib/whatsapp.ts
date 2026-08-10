// Número oficial de contacto de Amigo Cargo (formato E.164 sin "+", como lo requiere wa.me).
export const WHATSAPP_PHONE = "584122881888";

/**
 * Genera un enlace de WhatsApp hacia el número de Amigo Cargo con un mensaje
 * predeterminado ya escrito, para que cada botón de la web abra el chat con
 * un texto acorde a la acción que el usuario estaba realizando.
 */
export function buildWhatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
