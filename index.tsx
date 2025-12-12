import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Analytics } from "@vercel/analytics/react"
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false // We will handle this manually or let default behavior work if preferred, but usually false for SPAs if using a wrapper
  })
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
      <Analytics />
    </PostHogProvider>
  </React.StrictMode>
);