# 📝 Modern Chyrp

A minimalist, **AI-powered blogging platform** built with **Next.js, Firebase, and Genkit AI**.
Modern Chyrp offers a distraction-free writing and reading experience, customizable themes, and intelligent writing assistance for bloggers who value simplicity and creativity.

---

## 🚀 Quick Links
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Features](#features)
- [Screenshots / Demos](#screenshots--demos)
- [Contributing](#contributing-guidelines)
- [Acknowledgments](#acknowledgments--credits)

---

## Tech Stack

-   **Frontend:** Next.js, React, Tailwind CSS
-   **Backend & Auth:** Firebase (Authentication, Firestore, Storage)
-   **AI Features:** Genkit AI, OpenAI API
-   **Deployment:** AWS

---

## Installation

To run Modern Chyrp locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/IncharaP972/studio.git
    cd studio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the project root and add your Firebase and AI keys:

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

    GOOGLE_API_KEY="your-google-api-key"
    GOOGLE_GENAI_API_KEY="your-genai-api-key"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open `http://localhost:3000` in your browser.

---

## Usage Guide

*   **Browse Blogs:** Navigate to `/blog` to view published posts.
*   **Read Posts:** Click on a blog title to open the article.
*   **User Dashboard:** Log in and go to `/dashboard` to manage posts.
*   **Theme Switcher:** Use the "Themes" button (bottom-right) on posts to change themes.

---

## Features

Modern Chyrp includes features that make blogging intuitive, powerful, and personalized.


- **Minimalist Writing & Reading Experience:** A clean, distraction-free interface that lets you focus on your content.  
- **AI-Powered Assistance:** Smart tools like AI-generated drafts, alt-text for images, optimized meta descriptions, and intelligent title/tag suggestions.  
- **Customizable Reading Themes:** Choose from multiple elegant themes (Sepia, Pastel, High Contrast, Cosmic Noir, and more) with seamless Light & Dark Mode.  
- **Secure User Authentication:** Robust sign-up and login with Firebase Authentication.  
- **Content Management Dashboard:** Create, edit, and publish posts with an intuitive dashboard.  
- **Community & Interactions:** Integrated comments, reactions, and search functionality for an engaging reader experience.  
- **Media Uploads:** Effortless image and asset management powered by Firebase Storage.  


### Blogging Essentials
-   Secure user authentication with Firebase
-   User-friendly dashboard for creating, editing, and managing posts
-   Integrated comments and reactions for community interaction
-   Blog post search functionality
-   Media uploads with Firebase Storage integration

### Customization & Reading
-   Dynamic, customizable reading themes:
    Default, 📜 Sepia Reader, 🌸 Minimal Pastel, 🖤 High Contrast,
    🌌 Cosmic Noir, 🍃 Forest Whisper, 🔮 Mystic Twilight, 🌊 Ocean Drift, 🔥 Solar Ember
-   Easy Light & Dark Mode toggle

---

## Screenshots / Demos

-   **Landing Page:**
-   **Blog Listing Page:** (add image link)
-   **Post with Theme Switcher:** (add image link)
-   **AI Writing Features in Action:** (add screenshot or GIF)

🎥 **Demo Video:** Add a demo video link (e.g., YouTube / Loom).

## Contributing Guidelines

Contributions are welcome!

1.  Fork the repository.
2.  Create a feature branch:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  Make your changes and commit:
    ```bash
    git commit -m "Add new feature"
    ```
4.  Push your branch:
    ```bash
    git push origin feature/your-feature-name
    ```
5.  Open a Pull Request to `main`.

Please follow the existing code style.


## Acknowledgments / Credits

*   Thanks to all contributors who helped build Modern Chyrp
*   Inspired by the fusion of **minimalism** and **AI-powered creativity**
*   Special thanks to the creators of Next.js, React, Tailwind CSS, Firebase, and Genkit AI
