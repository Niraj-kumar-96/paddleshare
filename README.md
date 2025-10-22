# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Development

To run the local development server, you'll need two separate terminals:

1.  **Start the Genkit services and Firebase Emulators:**
    ```bash
    npm run genkit:dev
    ```
    This command starts the Firebase Emulators for local development and Genkit for any AI features.

2.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```

### Accessing Your Databases

You have two database environments: a live production database and a local one for development.

**1. Local Development Database (Firebase Emulator)**

When you run `npm run genkit:dev`, the local database emulator starts automatically. You can interact with it using the **Firebase Emulator UI**.

- **URL:** Look for the "Emulator UI running at" message in your terminal. It's usually `http://127.0.0.1:4000`.
- **Usage:** This web interface allows you to view, edit, and delete data in your local Firestore, manage local test users, and test security rules. Data is persisted between sessions in the `.genkit/local` directory.

**2. Live Production Database (Firebase Console)**

To manage the live data for your deployed application, use the official Firebase Console.

- **URL:** [https://console.firebase.google.com/](https://console.firebase.google.com/)
- **Usage:** Select your project (`studio-1361173776-8eebb`) and navigate to the "Firestore Database" section to manage your live data.
