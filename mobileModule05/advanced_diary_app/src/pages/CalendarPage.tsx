import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { colors, fonts } from '../theme';
import { auth, db } from '../../firebaseConfig'; 
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { DiaryEntry } from '../models/DiaryEntry';
import { EntryCard } from '../components/EntryCard';
import DetailEntryModal from '../components/modals/DetailEntryModal';
import DeleteEntryModal from '../components/modals/DeleteEntryModal';

LocaleConfig.locales['fr'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar', 'Apr', 'May', 'Jun', 'Jul.', 'Aug', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: "Today"
};
LocaleConfig.defaultLocale = 'fr';

export default function CalendarPage() {
  const user = auth.currentUser;
  const [selectedDate, setSelectedDate] = useState('');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
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

  const openDeleteModal = (id: string) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setEntryToDelete(null);
    setDeleteModalVisible(false);
  };
  
  useEffect(() => {
    if (!user || selectedDate === '') return;
    setLoading(true);

    const [year, month, day] = selectedDate.split('-');
    const startOfDay = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
    const endOfDay = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);

    const q = query(
      collection(db, 'diaryEntries'),
      where('userId', '==', user.uid),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
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
      console.error("Erreur lors de la récupération des journaux:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedDate]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView
        nestedScrollEnabled
        onScrollBeginDrag={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>My Calendar</Text>

        <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={{
              [selectedDate]: { selected: true, disableTouchEvent: true },
            }}

            theme={{
              backgroundColor: colors.paper,
              calendarBackground: colors.paper,
              textSectionTitleColor: colors.forestDark,
              selectedDayBackgroundColor: colors.sage,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.forestDark,
              todayBackgroundColor: colors.sageLight,
              dayTextColor: colors.forest,
              textDisabledColor: colors.muted,
              dotColor: colors.forest,
              selectedDotColor: colors.white,
              arrowColor: colors.forest,
              monthTextColor: colors.forestDark,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayFontFamily: fonts.body,
              textDayHeaderFontFamily: fonts.handwritingBold,
              textMonthFontFamily: fonts.handwritingBold
            }}
          />
        </View>

        {!selectedDate && (
          <View style={styles.detailsContainer}>
            <Text style={styles.placeholderText}> Select a date to view your memories.</Text>
          </View>
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.forest} />
          </View>
        ) : (
          <>
              {entries.length === 0 ? (
                  <View style={styles.detailsContainer}>
                      <Text style={styles.emptyText}>Your journal is empty.</Text>
                      <Text style={styles.emptySubText}>It's time to write your first entry!</Text>
                  </View>
              ) : (
                  <ScrollView
                    style={styles.listContainer}
                    contentContainerStyle={styles.listContent}
                    nestedScrollEnabled
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                    keyboardShouldPersistTaps="handled"
                  >
                      {entries.map((entry) => (
                          <EntryCard
                              key={entry.id}
                              item={entry}
                              onDelete={openDeleteModal}
                              onOpenDetail={openDetailModal}
                          />
                      ))}
                  </ScrollView>
              )}
          </>
        )}
        </ScrollView>

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
  pageTitle: {
    fontSize: 28,
    fontFamily: fonts.handwritingBold,
    color: colors.forestDark,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  calendarWrapper: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.ink
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  detailsText: {
    fontSize: 16,
    color: colors.forest,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 20,
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: 'center',
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
  listContainer: {
    marginTop: 20,
    maxHeight: 400,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
});