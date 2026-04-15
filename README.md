# ☁️ CloudVault — Secure Cloud Storage

A full-stack secure cloud storage web application built with HTML, CSS, JavaScript (frontend) and Node.js + Express + AWS S3 (backend).

---

## 🚀 Features

- 📁 Upload, view, and delete files
- 🖼️ File viewer — images, PDFs, videos, audio open in-browser (no download)
- 🗂️ Category filter — Images, Documents, Media, Others
- ⭐ Favorites — star files for quick access
- 🗑️ Trash — soft delete with restore option
- 📊 Statistics — storage usage and file breakdown
- 👥 Shared Folders panel
- 🔍 Live search across all files
- 🎨 Theme switcher — Light, Dark, Warm
- 🏠 Landing page with Get Started flow
- ☁️ AWS S3 integration for cloud storage
- 📱 Responsive design

---

## 🗂️ Project Structure
cloudvault/
├── index.html       # Frontend UI
├── style.css        # All styles + themes
├── app.js           # Frontend logic
├── server.js        # Node.js + Express backend
├── .env             # AWS credentials (never commit this)
├── package.json
└── README.md

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cloudvault.git
cd cloudvault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root folder:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket_name_here
PORT=5000
```

### 4. Start the backend server

```bash
node server.js
```

### 5. Open the frontend

Open `index.html` with **Live Server** in VS Code, or visit:
