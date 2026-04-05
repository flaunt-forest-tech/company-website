import type { CSSProperties } from 'react';

import { redirect } from 'next/navigation';

import { getAdminUsername, isAdminAuthenticated, isAdminConfigured } from '@/lib/admin-auth';

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

type AdminLoginPageProps = {
  searchParams?: SearchParams;
};

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '460px',
  background: '#ffffff',
  color: '#111827',
  borderRadius: '18px',
  padding: '28px',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.28)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  marginTop: '6px',
  marginBottom: '14px',
  fontSize: '15px',
};

const buttonStyle: CSSProperties = {
  width: '100%',
  border: 'none',
  borderRadius: '10px',
  background: '#2563eb',
  color: '#ffffff',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect('/admin');
  }

  const params = (await searchParams) ?? {};
  const hasError = params.error === '1';
  const hasExpired = params.expired === '1';
  const configured = isAdminConfigured();

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={{ margin: '0 0 8px', color: '#2563eb', fontWeight: 700 }}>Internal only</p>
        <h1 style={{ margin: '0 0 10px', fontSize: '30px' }}>Company Analytics</h1>
        <p style={{ margin: '0 0 20px', color: '#4b5563', lineHeight: 1.6 }}>
          This dashboard tracks daily traffic and the most viewed pages on the website.
        </p>

        {!configured ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#fff7ed',
              color: '#9a3412',
            }}
          >
            Set <code>ADMIN_DASHBOARD_USERNAME</code> and <code>ADMIN_DASHBOARD_PASSWORD</code> in
            your environment before using this page.
          </div>
        ) : null}

        {hasExpired ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#1d4ed8',
            }}
          >
            Your admin session was signed out after 30 minutes of inactivity.
          </div>
        ) : null}

        {hasError ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#fef2f2',
              color: '#b91c1c',
            }}
          >
            Login failed. Please check the company dashboard username and password.
          </div>
        ) : null}

        <form action="/api/admin/login" method="post">
          <label htmlFor="username" style={{ fontWeight: 600 }}>
            Username
          </label>
          <input
            id="username"
            name="username"
            defaultValue={configured ? '' : getAdminUsername()}
            placeholder="Enter company username"
            autoComplete="username"
            style={inputStyle}
          />

          <label htmlFor="password" style={{ fontWeight: 600 }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle} disabled={!configured}>
            Sign in to dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
