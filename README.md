# Loyalty SaaS Platform

A full-stack SaaS application built with Next.js (App Router), MongoDB, and NextAuth that enables
small UK businesses (salons, cafes, bakeries, barbers, etc.) to run digital loyalty programs.
The platform removes the need for physical loyalty cards. Customers earn points or stamps on
each visit via QR code scanning or manual approval. Store owners can configure reward logic,
approve visits, and manage customers. Admins can oversee all stores, users, and usage stats
across the application.
■ Live Demo: https://loyalty-saas-xo8e.vercel.app (dummy link – replace with your deployed
version on Vercel)

---

## Features

### Authentication & Roles

- Secure login with NextAuth (Credentials + JWT)
- Users choose their role at login:
- Admin – manage all stores and users across the platform
- Store Admin – manage a single store’s visits, users, and rewards
- Customer – earn/redeem loyalty points, view their history
- Password reset (email token flow)
- In-memory rate limiting for sensitive routes

### Admin Dashboard

- Manage all stores (create, update, suspend)
- Reset reward rules or billing tiers
- Manage all users (assign roles)
- Export reports in CSV/PDF

### Store Dashboard

- Configure loyalty logic: visit-based or spend-based
- Approve/reject visits from users (manual or QR-based)
- Manage store users, adjust their points
- Track reward redemptions
- Export reports
- Notifications when usage tiers are reached

### Customer Dashboard

- Scan QR codes to request visit approval
- View visit history and points balance
- Redeem rewards automatically when thresholds are reached
- Manage profile and connected stores
- Opt-in/out of promotional emails

---

## Tech Stack

Frontend

- Next.js 14 (App Router, API Routes)
- React 19
- Tailwind CSS 4
- shadcn/ui for modern components
  Backend
- MongoDB with Mongoose
- NextAuth.js for authentication
- Zod for validation
- bcryptjs for password hashing
- Resend for transactional email (password resets)
- In-memory rate limiting
  Deployment
- Vercel (Frontend + API routes)
- MongoDB Atlas (Database)

---

## Author

Built by [Yuvraj Sharma]
Portfolio: https://portfolio-yuvraj-sharmas-projects.vercel.app
