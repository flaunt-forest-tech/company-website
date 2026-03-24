'use server';

import { Resend } from 'resend';
import { ContactFormInputs } from '../contact/page';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(formData: ContactFormInputs) {
  const email = formData.email;
  const phone = formData.phone;
  const name = formData.name;
  const inquiryType = formData.inquiryType;
  const message = formData.message.replace(/\n/g, '<br/>');
  const subject = `[${inquiryType}] ${formData.subject} | ${name}`;
  const html = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Consultation Goal:</strong> ${inquiryType}</p>
    <p><strong>Subject:</strong> ${formData.subject}</p>
    <hr/>
    <p>${message}</p>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['sales@flauntforest.com'],
      subject: subject,
      html,
    });
    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email send error:', error);
    return { success: false, error: errorMessage };
  }
}
