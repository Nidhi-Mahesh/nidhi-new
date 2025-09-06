# 📝 Modern Chyrp
Website link- http://51.20.130.193:3000/
A minimalist, **AI-powered blogging platform** built with **Next.js, Firebase, and Genkit AI**.
Modern Chyrp offers a distraction-free writing and reading experience, customizable themes, and intelligent writing assistance for bloggers who value simplicity and creativity.

---

## 🚀 Quick Links
- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Firebase Configuration](#firebase-configuration)
- [Database Setup](#database-setup)
- [Usage Guide](#usage-guide)
- [Features](#features)
- [Screenshots / Demos](#screenshots--demos)
- [Contributing](#contributing-guidelines)
- [Acknowledgments](#acknowledgments--credits)

---
## Prerequisites

Before installing, make sure you have the following on your system:
- **Node.js** (Version 18 or higher). [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A **Firebase project** with Authentication, Firestore Database, and Storage configured.
- An **OpenAI API account** and API key (for AI features).

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

6. **(Optional) Build for production:**
   npm run build
   npm start  
---

## Firebase Configuration

To get the necessary Firebase config values:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one.
3. Enable **Authentication**, **Firestore Database**, and **Storage**.
4. In your project settings (⚙️ > Project settings), go to the "Your apps" section.
5. **Add a web app** if you haven't already.
6. Copy the config object they provide. It will look like this:
    const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
    };
7. Use these values to populate your `.env.local` file as shown above.

---

## Database Setup

This project uses Firebase Firestore. No initial schema setup is required, as the application creates collections and documents on the fly.

However, for proper functionality, you must deploy the Firestore Security Rules from the `firestore.rules` file in this repository.  
Use the Firebase CLI:
firebase deploy --only firestore:rules

---

## Usage Guide

* **Browse Blogs:** Navigate to `/blog` to view published posts.
* **Read Posts:** Click on a blog title to open the article.
* **User Dashboard:** Log in and go to `/dashboard` to manage posts.
* **Theme Switcher:** Use the "Themes" button (bottom-right) on posts to change themes.

### For Demo / Testing:
- **Sign up** for a new account to access the dashboard.
- **Create a new post** using the editor.
- **Try the AI features** (for example, "Suggest a Title").
- **Publish the post** and view it on the main blog page.
- **Try the theme switcher** on the published post.

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
  <img width="1888" height="1174" alt="file_2025-09-06_08 04 03 1" src="https://github.com/user-attachments/assets/685c1cca-99db-4af3-9488-16b971eec8e4" />

-   **Blog Listing Page:** 
   
![blog1](https://github.com/user-attachments/assets/8e783226-f22e-4d00-ad02-b562617c73a8)

![blog2](https://github.com/user-attachments/assets/affde636-e543-41f1-b600-0ff7db104c87)


-   **AI Writing Features in Action:**
  ---
   ![blog3](https://github.com/user-attachments/assets/751b2999-396c-4d6c-a8e9-28f36ec32169)


🎥 **Demo Video:** (https://go.screenpal.com/watch/cTQ1I3noYRm)

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
