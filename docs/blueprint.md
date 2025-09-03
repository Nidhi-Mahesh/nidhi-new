# **App Name**: Modern Chyrp

## Core Features:

- User Authentication: Implement user registration, login, and profile management with RBAC roles (Admin, Editor, Author, Moderator, Reader).
- Text Post Creation: Enable authors to create, edit, and publish text-based blog posts using a rich Markdown/HTML editor with autosave and live preview.
- Media Management: Allow users to upload, manage, and embed media files (images, videos, audio) with compression and responsive resizing.
- Landing Page: Create a 3D scrollytelling landing page using Spline, with scroll-pinned chapters and robust fallbacks for accessibility and performance. Has FEATURE_3D_LANDING feature flag.
- Admin Console: Develop an admin interface for managing posts, media, users, settings, themes, and extensions.
- Theme Skeleton: Implement a basic theme structure with file-based templates, design tokens, and light/dark mode support.
- OpenAPI Documentation: Generate OpenAPI documentation for the backend API endpoints, available at /api/docs.
- Installability & Onboarding: Implement one-command setup, including migrations, admin seeding, and demo content. Create a first-run wizard for site configuration.
- Feathers (Content Types): Implement the 7 core 'feathers': Text, Photo, Quote, Link, Video, Audio, Uploader. Each should support create/edit/delete/view operations.
- Engagement & Community Features: Implement comments, likes, and post views, including threaded comments, moderation queue, email notifications, MAPTCHA spam protection, webmentions, per-user/IP deduplication for likes, and trending indicators.
- Organization & Discovery: Implement tags, categories, archives, and full-text search with suggestions, along with 'Read More' truncation.
- Theming & Extensibility: Implement theming with file-based templates/partials, design tokens, and light/dark modes. Implement modules as a pluggable registry.
- SEO & Syndication: Implement Atom feed, sitemap.xml, canonical URLs, OG/Twitter meta tags, and structured data.
- Users & Permissions: Implement RBAC with Admin, Editor, Author, Moderator, Reader roles and fine-grained permissions.
- Modules: Implement the core set of 15 modules: Cacher, Categorize, Tags, Mentionable, Comments, Likes, Read More, Rights, Cascade, Lightbox, Sitemap, MAPTCHA, Highlighter, Easy Embed, Post Views.
- Database & Backend: Set up PostgreSQL database with core tables (users, posts, media, comments, etc.), constraints, and indexes. Implement Redis caching.
- AI-Assisted Title Suggestions: As an optional AI feature (FEATURE_AI_ASSIST), suggest 5 variants of titles for a post using a generative AI tool.
- AI-Assisted Meta Description Generation: As an optional AI feature (FEATURE_AI_ASSIST), generate a meta description for a post using a generative AI tool.
- AI-Assisted Alt Text Generation: As an optional AI feature (FEATURE_AI_ASSIST), generate alt text for images using a generative AI tool.
- AI-Assisted Tag Suggestions: As an optional AI feature (FEATURE_AI_ASSIST), suggest smart tags and categories with confidence levels using a generative AI tool.
- AI-Assisted Draft Generation: As an optional AI feature (FEATURE_AI_ASSIST), generate an outline and first draft from a headline/brief (queued job, always editable) using a generative AI tool.
- AI-Assisted Translation: As an optional AI feature (FEATURE_AI_ASSIST), generate localized versions of posts (human review required) using a generative AI tool.
- AI-Powered Post Q&A: As an optional AI feature (FEATURE_AI_ASSIST), enable per-post 'Ask about this post' Q&A using retrieval-augmented generation strictly over that post and its cited links using a generative AI tool.

## Style Guidelines:

- Primary color: Soft lavender (#E6E6FA) to create a calming and sophisticated feel.
- Background color: Light cyan (#E0FFFF), providing a fresh and airy backdrop that complements the primary color without overshadowing it.
- Accent color: A vibrant magenta (#FF00FF), used sparingly to draw attention to key interactive elements and calls to action.
- Headline font: 'Space Grotesk' sans-serif for a modern, tech-inspired aesthetic; Body font: 'Inter' sans-serif for readability.
- Code font: 'Source Code Pro' monospace for displaying code snippets clearly.
- Use a set of simple, geometric icons that align with the platform's modern and clean design aesthetic.
- Subtle, non-intrusive animations to enhance user experience (e.g., smooth transitions, loading indicators).