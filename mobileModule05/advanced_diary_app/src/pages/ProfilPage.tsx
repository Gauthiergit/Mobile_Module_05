import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Keyboard, ScrollView, Platform } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DiaryEntry } from '../models/DiaryEntry';
import { EntryCard } from '../components/EntryCard';
import CreateEntryModal from '../components/modals/CreateEntryModal';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import DeleteEntryModal from '../components/modals/DeleteEntryModal';
import DetailEntryModal from '../components/modals/DetailEntryModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { Feeling, feelingRecord } from '../types/Feeling';
import { calculatePercentage } from '../utils/calculation';

export default function ProfilePage({ navigation }: any) {
  const user = auth.currentUser;

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const openDetailModal = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setDetailModalVisible(true);
  };
  const closeDetailModal = () => {
    setSelectedEntry(null);
    setDetailModalVisible(false);
  };


  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'diaryEntries'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: DiaryEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate() : data.date;
        entriesData.push({ id: doc.id, ...data, date } as DiaryEntry);
      });
      setEntries(entriesData);
      setLoading(false);
    }, (error) => {
      console.error("Error when try to get entries", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const entriesDisplayed = useMemo(() => {
    return entries.slice(0, 2);
  }, [entries]);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('user_session').catch(() => {});
    await signOut(auth);
    navigation.replace('Home'); 
  };

  const openDeleteModal = (id: string) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setEntryToDelete(null);
    setDeleteModalVisible(false);
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
            <Text style={{color: 'black'}}>No users logged in.</Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.signOutBtn}>
                <Text style={styles.btnText}>Go to login</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.forest} />
        </View>
      );
    }

  return (
    
    <SafeAreaView style={styles.mainContainer}>
        <ImageBackground
          source={require('../../assets/home_background.jpg')}
          style={styles.header}
          resizeMode="cover"
        >
            {user.photoURL && (
              Platform.OS === 'web' ? (
                <img 
                  src={user.photoURL} 
                  referrerPolicy="no-referrer"
                  style={styles.avatar}
                />
              ) : (
                <Image 
                  source={{ uri: user.photoURL }} 
                  style={styles.avatar} 
                />
              )
            )}
            <Text style={styles.userName}>
                {user.displayName || user.email}
            </Text>
        
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
                <MaterialIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
        </ImageBackground>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Diary</Text>
            <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => setCreateModalVisible(true)}
            >
                <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
        </View>
        {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your journal is empty.</Text>
          <Text style={styles.emptySubText}>It's time to write your first entry !</Text>
        </View>
      ) : (
        <ScrollView
              contentContainerStyle={styles.contentContainer}
              onScrollBeginDrag={() => Keyboard.dismiss()}
              keyboardShouldPersistTaps="handled"
        >
          <View style={styles.lastEntriesContainer}>
            <Text style={styles.lastEntriesTitle}>Your last diary entries</Text>
            <ScrollView
              contentContainerStyle={styles.listContent}
              onScrollBeginDrag={() => Keyboard.dismiss()}
              keyboardShouldPersistTaps="handled"
            >
              {entriesDisplayed.map((entry) => (
                <EntryCard
                  key={entry.id}
                  item={entry}
                  onDelete={openDeleteModal}
                  onOpenDetail={openDetailModal}
                />
              ))}
            </ScrollView>
          </View>
          <View style={styles.feelsContainer}>
              <Text style={styles.feelsTitle}>Your feel for yours {entries.length} entries</Text>
              <View style={styles.feelsList}>
                {Object.values(Feeling)
                  .filter((feel): feel is Feeling => typeof feel === 'number')
                  .map((feel) => {
                  const config = feelingRecord[feel];
                  const IconComponent = config.icon;
                  return (
                    <View key={config.label} style={styles.feelContent}>
                      <IconComponent size={24} color={config.color} />
                      <Text style={styles.percentageText}>{calculatePercentage(feel, entries)} %</Text>
                    </View>
                  );
                })}
              </View>
          </View>
        </ScrollView>
      )}

      <CreateEntryModal 
        visible={isCreateModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
      />

      <DetailEntryModal
        entry={selectedEntry}
        visible={isDetailModalVisible}
        onClose={closeDetailModal}
      />

      <DeleteEntryModal
        entryToDelete={entryToDelete}
        visible={isDeleteModalVisible}
        onClose={closeDeleteModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 'auto',
    height: 140,
    padding: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: colors.paperBright,
  },
  userName: {
    fontSize: 20,
    fontFamily: fonts.handwritingBold,
    color: colors.paperBright,
    textAlign: 'center',
    marginBottom: 4,
  },
  signOutBtn: {
    width: 'auto',
    backgroundColor: colors.danger,
    padding: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer : {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.paperBright,
    gap: 24
  },
  contentContainer: {
    gap: 10
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  lastEntriesContainer: {
    backgroundColor: colors.paperBright,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    marginHorizontal: 20,
  },
  lastEntriesTitle: {
    fontFamily: fonts.handwritingBold,
    fontSize: 20,
    padding: 10,
    marginHorizontal: 10
  },
  feelsContainer: {
    backgroundColor: colors.paperBright,
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    marginHorizontal: 20,
  },
  feelsList:{
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 10,
    paddingBottom: 4
  },
  feelContent: {
    flexDirection: 'row',
    width: '45%',
    gap: 20,
  },
  percentageText: {
    fontFamily: fonts.body,
    fontSize: 20
  },
  feelsTitle: {
    fontFamily: fonts.handwritingBold,
    fontSize: 20,
    padding: 10
  },

  // --- VIDE ---
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 30
  },
  emptyText: {
    fontSize: 30,
    fontFamily: fonts.handwritingBold,
    color: colors.ink,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 20,
    color: colors.muted,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginBottom: 15,
  marginTop: 15
},
// ADD ENTRY
sectionTitle: {
  fontSize: 30,
  fontFamily: fonts.handwritingBold,
  textAlign: 'center',
  color: colors.forestDark,
  paddingHorizontal: 2
},
addBtn: {
  backgroundColor: colors.forest,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
},
addBtnText: {
  color: colors.white,
  fontFamily: fonts.handwritingBold,
  fontSize: 18,
  padding: 2
},
});