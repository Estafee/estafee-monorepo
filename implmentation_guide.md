# 📦 Item Lending Platform — MVP
**Monorepo: Next.js (Frontend) + NestJS (Backend)**  
This README guides an **AI agent** to build and complete an MVP of an item-lending platform.

## 🧠 Purpose  
This document instructs the AI agent how to work inside this monorepo.

> ✔️ Agent MUST check first whether each feature already exists in either frontend or backend.  
> ✔️ If feature exists → reuse, extend, or refactor.  
> ❌ Never rebuild existing working functionalities.

# 🏗️ Monorepo Structure

```
/apps
  /frontend   → Next.js 14 App Router
  /backend    → NestJS API server

/packages
  (shared utilities, types, constants, if any)
```

# 🚀 MVP Feature Summary

### Core Features  
- User registration & login  
- User profile (public)  
- Add/edit/delete items  
- Browse/explore items  
- View item details  
- Borrow request flow  
- Simulated payment (no real API)

### Required Pages (Next.js)
- Landing Page  
- Explore Page  
- Item Details Page  
- Public Profile Page  
- Dashboard Page  
- Login & Register Pages

# 🔧 Backend Architecture (NestJS)

### Modules
- AuthModule  
- UsersModule  
- ItemsModule  
- BorrowModule (optional simplified MVP)

### Entities

#### User
```
id, name, email, passwordHash, profilePicture, createdAt
```

#### Item
```
id, ownerId, title, description, imageUrl, status ("available" | "borrowed"), createdAt
```

#### BorrowRequest
```
id, itemId, borrowerId, status ("requested" | "confirmed")
```

# 🎨 Frontend Architecture (Next.js)

Pages under `/app`:
```
/           → Landing
/explore    → Items list
/item/[id]  → Details
/profile/[id] → User profile
/dashboard  → CRUD items
/auth/login
/auth/register
```

# 🔎 AI Agent Workflow Rules

## 1. Check Before Creating
Agent must verify existence of:
- frontend components/pages  
- backend modules/controllers  
- shared types  
- auth system  
- database models  

If exists → reuse & integrate.

## 2. Do Not Duplicate  
Never generate new endpoints or pages that already exist.

## 3. Simulated Payment  
Borrow flow:
- Click “Request to Borrow”
- Modal: “Simulated payment”
- Confirm updates item status to "borrowed"

# 📄 Page Descriptions

### Landing Page  
Simple intro + CTA.

### Explore Page  
Grid view of available items.

### Item Details Page  
Show item info + borrow button.

### Public Profile  
Shows user info + items.

### Dashboard  
CRUD items.

### Login/Register  
Standard email/password auth.

# ✔️ MVP Checklist

### Functional
- Users can auth
- Explore items
- View details
- Borrow (simulated)
- CRUD items
- Public profiles

### Technical
- No duplicated features  
- Reuse of existing code  
- Documented endpoints  

# 📌 Final Notes for the AI Agent  
- Always inspect repo before coding  
- Follow monorepo conventions  
- Document any additions  
