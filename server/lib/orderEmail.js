/**
 * Order confirmation email. Checkout always shows the Technical Error screen
 * after place order (never the Order confirmed success page).
 */
export function isOrderEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export async function sendOrderConfirmationEmail(order, recipientEmail) {
  const to = String(recipientEmail || order?.email || '').trim();
  if (!to) {
    return { sent: false, reason: 'no_recipient' };
  }

  if (!isOrderEmailConfigured()) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER;
    const siteName = process.env.SITE_NAME || 'Trendkaari';

    await transporter.sendMail({
      from,
      to,
      subject: `${siteName} — Order ${order.id} confirmed`,
      text: [
        `Hi ${order.customerName || 'there'},`,
        '',
        `Thank you for shopping with ${siteName}.`,
        `Order ID: ${order.id}`,
        `Total: ₹${order.grandTotal}`,
        `Status: ${order.status}`,
        '',
        'We will notify you when your order ships.',
      ].join('\n'),
    });

    return { sent: true };
  } catch (err) {
    console.warn('[order-email] send failed:', err?.message || err);
    return { sent: false, reason: 'send_failed' };
  }
}
