import { useEffect, useRef, useState } from 'react';
import { Text, View, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { 
  GithubAuthProvider, 
  GoogleAuthProvider, 
  signInWithCredential, 
  onAuthStateChanged, 
  User, 
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../firebaseConfig'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export default function LoginPage({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function SaveUserAsync (user: User){
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
    } catch (e) {
      console.error("Erreur AsyncStorage :", e);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await SaveUserAsync(currentUser);
        navigation.replace('MainTabs');
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user_session').catch(() => {});
      }
      setLoading(false);
    });
    
    AsyncStorage.getItem('user_session').then((storedUser) => {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        navigation.replace('MainTabs');
      }
    });

    return unsubscribe;
  }, []);

  const handledCodeRef = useRef<string | null>(null);

  const gitHubRedirectUri = AuthSession.makeRedirectUri(
    Platform.OS === 'web'
      ? { preferLocalhost: true }
      : { scheme: 'diaryapp' }
  );

  const githubDiscovery = {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
  };

  const [githubReq, githubRes, promptGithubAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID!,
      scopes: ['user:email'],
      redirectUri: gitHubRedirectUri,
    },
    githubDiscovery
  );

  const handleGithubSignin = async () => {
    if (Platform.OS === 'web') {
      setLoading(true);
      const provider = new GithubAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result?.user) {
          setUser(result.user);
          await SaveUserAsync(result.user);
        }
      } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
          console.error('Erreur Auth GitHub Web:', error);
        }
      } finally {
        setLoading(false);
      }
    } else {
      promptGithubAsync();
    }
  };

  useEffect(() => {
    const handleGithubResponse = async () => {
      if (Platform.OS !== 'web' && githubRes?.type === 'success' && githubRes.params.code) {
        const code = githubRes.params.code;
        if (handledCodeRef.current === code) return;
        handledCodeRef.current = code;

        setLoading(true);
        try {
          const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
              client_secret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET,
              code: code,
              redirect_uri: gitHubRedirectUri,
              code_verifier: githubReq?.codeVerifier,
            }),
          });

          const tokenData = await tokenRes.json();

          if (tokenData.access_token) {
            const credential = GithubAuthProvider.credential(tokenData.access_token);
            await signInWithCredential(auth, credential);
          } else {
            console.error('Erreur jeton GitHub:', tokenData);
          }
        } catch (error) {
          console.error('Erreur Auth GitHub:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleGithubResponse();
  }, [githubRes, githubReq]);


  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    ...(Platform.OS === 'web' && {
      redirectUri: AuthSession.makeRedirectUri({ preferLocalhost: true })
    })
  });

  useEffect(() => {
    const signInWithGoogle = async () => {
      if (response?.type !== 'success') return;

      const { id_token } = response.params;
      const accessToken = response.authentication?.accessToken;

      try {
        if (id_token) {
          const credential = GoogleAuthProvider.credential(id_token);
          await signInWithCredential(auth, credential);
        } else if (accessToken) {
          const credential = GoogleAuthProvider.credential(null, accessToken);
          await signInWithCredential(auth, credential);
        }
      } catch (error) {
        console.error('Erreur Auth Google:', error);
      }
    };

    signInWithGoogle();
  }, [response]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Log in</Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            disabled={Platform.OS !== 'web' && !githubReq}
            onPress={handleGithubSignin}
            style={[styles.socialBtn, styles.githubBtn, (Platform.OS !== 'web' && !githubReq) && styles.disabledBtn]}
          >
            <AntDesign name="github" size={24} color="white" />
            <Text style={styles.btnText}>Continue with GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!request}
            onPress={() => promptAsync()}
            style={[styles.socialBtn, styles.googleBtn, !request && styles.disabledBtn]}
          >
            <AntDesign name="google" size={24} color="white" />
            <Text style={styles.btnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.paper,
  },
  
  // --- ÉCRAN PROFIL ---
  profileCard: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    borderColor: '#f3f4f6', // border-gray-100
    // Ombres natives (remplace shadow-sm)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#eff6ff', // blue-50
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280', // gray-500
    textAlign: 'center',
    marginBottom: 32,
  },
  signOutBtn: {
    width: '100%',
    backgroundColor: '#ef4444', // red-500
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 8,
  },
  backBtnText: {
    color: '#9ca3af', // gray-400
    fontSize: 14,
  },

  // --- ÉCRAN CONNEXION ---
  loginContainer: {
    width: '100%',
    maxWidth: 320,
  },
  loginTitle: {
    fontSize: 34,
    fontFamily: fonts.handwritingBold,
    textAlign: 'center',
    color: colors.forestDark,
    marginBottom: 32,
  },
  buttonGroup: {
    gap: 16, // Équivalent de space-y-4 et gap-4
  },
  socialBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  githubBtn: {
    backgroundColor: colors.forestDark,
  },
  googleBtn: {
    backgroundColor: colors.sage,
  },
  btnText: {
    color: colors.white,
    textAlign: 'center',
    fontFamily: fonts.handwritingBold,
    fontSize: 20,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  cancelBtn: {
    marginTop: 32,
  },
  cancelBtnText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
});