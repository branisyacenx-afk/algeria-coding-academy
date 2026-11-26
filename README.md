# Algeria Coding Academy

A bilingual-ready learning platform for Algeria, built around Supabase and Vercel.

## Current project foundation
- Responsive public academy landing page.
- Supabase authentication using the public publishable key.
- Published course listing.
- Admin-only course management starter (create, edit, publish/unpublish, delete) guarded by the authenticated profile role and Supabase RLS.
- Official academy mark at `public/logo.svg`, used throughout the UI.

## Setup
1. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key.
2. Run `npm install` then `npm run dev`.
3. Deploy the project to Vercel with the same environment variables.

Never put a Supabase service-role key, NardoPay API key, or webhook signing secret in browser variables. Keep provider secrets in Supabase Edge Function secrets.

## Important
This repository is a clean, organized application foundation. It does not claim that every academy module is complete or production-verified yet. Payment fulfillment, private video access, quizzes, certificates, support, forum, live sessions, coupons, audit reporting and full visual page-builder workflows must be integrated and tested against the existing Supabase schema before launch.
