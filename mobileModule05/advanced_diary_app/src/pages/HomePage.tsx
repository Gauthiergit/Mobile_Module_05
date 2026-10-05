import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export default function HomePage({ navigation }: any) {
  return (
    <ImageBackground
      source={require('../../assets/home_background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Calque sombre par-dessus l'image pour faire ressortir le texte */}
      <View style={styles.overlay} />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Welcome to your Diary
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginBtn}
        >
          <Text style={styles.loginBtnText}>
            Log in
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 'auto',
    overflow: 'hidden',
    flexShrink: 0
  },
  overlay: {
    ...StyleSheet.absoluteFill, // Remplace 'absolute inset-0'
    backgroundColor: 'rgba(36, 67, 54, 0.42)',
  },
  contentContainer: {
    zIndex: 10,
    alignItems: 'center',
    padding: 24, // p-6
    width: '100%',
  },
  title: {
    fontSize: 52,
    fontFamily: fonts.handwritingBold,
    color: colors.paperBright,
    marginBottom: 16, // mb-4
    textAlign: 'center',
    letterSpacing: 0,
  },
  loginBtn: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.paperBright,
    paddingVertical: 16, // py-4
    borderRadius: 10,
    // Ombres natives (remplace shadow-xl)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8, // Pour Android
  },
  loginBtnText: {
    color: colors.forest,
    textAlign: 'center',
    fontFamily: fonts.handwritingBold,
    fontSize: 24,
  }
});