# VOICYY 🎙️

### Voice-first forms for richer, more authentic feedback.

VOICYY is a modern form platform that lets respondents answer questions using **voice recordings or text**. Instead of limiting feedback to typed responses, VOICYY enables natural conversations through audio while keeping the simplicity of traditional forms.

> *Inspired by the warmth and authenticity of **"Voicemails for Isabelle,"** VOICYY explores what forms could feel like if they embraced voice-first interactions.*

---

## ✨ Features

* 🎤 Record voice responses directly in the browser
* 📝 Support for both voice and text answers
* ☁️ Secure audio uploads to Supabase Storage
* 📊 Dashboard to view and manage submissions
* ▶️ Built-in audio playback for recorded responses
* 🔐 Authentication powered by Clerk
* 📱 Responsive design for desktop and mobile
* ⚡ Fast and modern UI built with Next.js

---

## 🛠️ Tech Stack

### Frontend

* Next.js 14 (App Router)
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js Route Handlers

### Database & Storage

* Supabase PostgreSQL
* Supabase Storage

### Authentication

* Clerk

### Browser APIs

* MediaRecorder API
* Web Audio APIs

---

## 🧩 How It Works

### 1. Create a Form

Create a custom form with voice or text questions.

### 2. Share

Publish the form and share it with anyone.

### 3. Respond

Users can answer questions by:

* 🎤 Recording their voice
* 📝 Typing a response

### 4. Store

Responses are securely stored in Supabase.

* Text → PostgreSQL
* Audio → Supabase Storage

### 5. Review

View every submission from the dashboard, including playable audio recordings.

---

## 🗂️ Project Structure

```text
app/
 ├── (auth)/
 ├── (dashboard)/
 ├── api/
 │    ├── forms/
 │    └── upload/
 └── forms/

components/
lib/
styles/
middleware.ts
```

---

## ⚙️ Installation

Clone the repository.

```bash
git clone https://github.com/vanshika114/voicyy.git
```

Move into the project.

```bash
cd voicyy
```

Install dependencies.

```bash
npm install
```

Create an environment file.

```bash
cp .env.example .env.local
```

Run the development server.

```bash
npm run dev
```

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
```

---

## 🎯 Future Improvements

* 📈 Response analytics
* 🤖 AI-powered voice transcription
* 📝 AI-generated summaries
* 🌍 Multi-language support
* 🎨 More customization options
* 📊 Export responses
* 📧 Email notifications
* 🔗 Shareable public analytics

---

## 📚 What I Learned

Building VOICYY helped me gain hands-on experience with:

* Browser MediaRecorder API
* Handling audio uploads
* File storage with Supabase
* Database design and relationships
* Authentication with Clerk
* Next.js App Router
* Route Handlers
* Managing mixed media responses
* Building end-to-end full-stack applications

---

## 💡 Inspiration

This project was inspired by **"Voicemails for Isabelle,"** a beautiful experience that highlights the emotional richness of voice. It made me wonder:

> **What if forms felt this personal too?**

VOICYY is my attempt to bring that idea into feedback collection.

---

## 🤝 Contributing

Contributions, suggestions, and feedback are always welcome!

If you'd like to improve VOICYY:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

### Built with ❤️ using Next.js, TypeScript, Clerk, and Supabase.
