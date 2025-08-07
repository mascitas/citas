"use client";

import React from 'react';

// This layout is minimal because the auth pages have their own full-page styling.
// We don't want the main app sidebar here.
export default function AuthLayout({ children }: { children: React.ReactNode; }) {
  return <>{children}</>;
}
