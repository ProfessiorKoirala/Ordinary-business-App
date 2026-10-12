# Implementation Plan - Google Drive AppData Folder Storage & OAuth Integration

Update `googleApi.ts` to strictly handle Google Drive `appDataFolder` for secure, user-private application storage, ensuring correct metadata and file mapping for user profile syncing. Also update the default Google OAuth Client ID to a fully functioning Web Client ID and clean up any legacy credentials.

## User Review Required

> [!IMPORTANT]
> - **AppData Folder Storage**: Data will be stored in the hidden `appDataFolder` space in Google Drive, invisible to normal user browsing in Google Drive but fully accessible and persistent across devices for the authenticated user.
> - **Excel Format**: Maintained as `obProData.xlsx` inside appDataFolder with full backup/sync capabilities.

## 1. Overview & Core Concept
- **What It Changes**: `googleApi.ts` search and save methods will target `spaces=appDataFolder` instead of the root Drive folder.
- **Security & Privacy**: Files stored in `appDataFolder` are private to the application and hidden from standard user files, protecting sensitive business records.

## 2. Technical Architecture & Data Strategy
```
┌───────────────────────────┐      Google OAuth Token      ┌──────────────────────────────┐
│  OB Pro Client App        │ ───────────────────────────> │ Google Drive AppData Folder  │
│  (React SPA / TypeScript) │ <─────────────────────────── │ (obProData.xlsx)             │
└───────────────────────────┘                              └──────────────────────────────┘
```

- **API Endpoints**:
  - Search: `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=...`
  - Upload/Create: `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&spaces=appDataFolder`
- **Metadata**:
  - `parents: ['appDataFolder']` when creating files.
