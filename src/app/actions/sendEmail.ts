'use server';

import { Resend } from 'resend';
import { ContactFormInputs } from '../contact/page';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(formData: ContactFormInputs) {
  const email = formData.email;
  const phone = formData.phone;
  const name = formData.name;
  const message = formData.message;
  const subject = `name: ${name} phone: ${phone} email: ${email} subject: ${formData.subject}`;

  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['sales@flauntforest.com'],
      subject: subject,
      html: message,
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}
