# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3f77e39e-8d2a-4d67-a758-dbcada8a6c90

## Architecture Overview

This is a real-time speech recognition and translation application built with React and TypeScript. Below is the architecture diagram showing the main components and their interactions:

```mermaid
graph TB
    A[MainApp] --> B[Header]
    A --> C[MainContent]
    A --> D[PrivacyModal]
    A --> E[SettingsPanel]
    A --> F[ErrorHandler]
    
    C --> G[RecordingControls]
    C --> H[TranscriptionDisplay]
    C --> I[ExportPanel]
    
    A --> J[useMainAppState]
    A --> K[useRecordingActions]
    A --> L[useAppEffects]
    A --> M[useTranscriptProcessing]
    
    K --> N[useSpeechRecognition]
    M --> O[useProcessingWorkflow]
    O --> P[useTranslationService]
    
    N --> Q[Browser Speech Recognition API]
    P --> R[OpenAI API]
    
    S[LanguageContext] --> A
    T[ThemeContext] --> A
    U[SettingsContext] --> A
    
    V[transcriptValidation] --> M
    W[voiceUtils] --> X[VoiceSelect]
    E --> X
    
    H --> Y[TranscriptionEntry Components]
    I --> Y
    
    style A fill:#e1f5fe
    style Q fill:#ffecb3
    style R fill:#ffecb3
    style S fill:#f3e5f5
    style T fill:#f3e5f5
    style U fill:#f3e5f5
```

### Component Flow:
1. **MainApp** serves as the root component managing global state
2. **Speech Recognition** captures audio input via browser APIs
3. **Transcript Processing** validates and processes speech input
4. **Translation Service** communicates with OpenAI API for translation
5. **UI Components** display results and provide user controls

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3f77e39e-8d2a-4d67-a758-dbcada8a6c90) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3f77e39e-8d2a-4d67-a758-dbcada8a6c90) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
