# Mobile_Module_05. 

This project is a diary app.  
The goal is to register some feedback of a day.  
You can write a Title, chose an Emotion and write your Content.  


I haven chosen to code in React Native with Expo.  
I chose to run this application on ios or on web.  
You need to use an ios simulator if you want to test it on phone (ios simulatior from xCode).  

## Get started

1. Install Node.js

  It will allows you to have the commands npm and npx.
  You can visit this website [NodeJs.org](https://nodejs.org/fr)

2. Add .en.local. 

  These datas are sensitive and you need to generate them by creating your own project on [Firebase](https://firebase.google.com/).  
  You need to add A Firestore also in your Firebase.  
  Finally you need to configurate Google connection on [Google Cloud Console](https://cloud.google.com/) and GitHub connection on your Git Hub account.  
  ```bash
  EXPO_PUBLIC_GITHUB_CLIENT_ID=
  EXPO_PUBLIC_GITHUB_CLIENT_SECRET=
  EXPO_PUBLIC_GITHUB_REDIRECTURI=

  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
  EXPO_PUBLIC_GOOGLE_IOS_REDIRECT_URI=
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
 
  EXPO_PUBLIC_FIREBASE_API_KEY=
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  EXPO_PUBLIC_FIREBASE_APP_ID=
  ```

4. Move on the project and launch it

   ```bash
   cd mobileModule04/diary_app
   make install
   make start
   ```

   If you want to test it on Simulator you need to create a prebuild before. 
   ```bash
   make prebuild
   ```
   ```bash
   make start-ios
   ```

5. Open the app

   After a make start:
   Tap 'w' on console to open app on web.

   After a make strat-ios:
   It open the app automatically on the simulator 