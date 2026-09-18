import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DiaryEntry } from "../models/DiaryEntry";
import { Feeling, feelingRecord } from "../types/Feeling";
import { AntDesign } from "@expo/vector-icons";
import { colors, fonts } from "../theme";

interface EntryCardProps {
  item: DiaryEntry,
  onDelete: (id: string) => void,
  onOpenDetail: (entry: DiaryEntry) => void
}

export const EntryCard = ({item, onDelete, onOpenDetail}: EntryCardProps) => {
  const dateStr = item.date instanceof Date ? item.date.toLocaleDateString('fr-FR') : 'Aujourd\'hui';
   const currentFeeling = feelingRecord[item.feeling as Feeling] || feelingRecord[Feeling.Neutral];
   const IconComponent = currentFeeling.icon;
   const currentColor = currentFeeling.color;
   const currentLabel = currentFeeling.label
  return (
    <TouchableOpacity 
      style={styles.entryCard} 
      onPress={() => onOpenDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.entryContainer}>
        <View style={styles.entryContent}>
          <View style={styles.entryTitleContainer}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            <Text style={styles.entryDate}>{dateStr}</Text>
          </View>
          <View style={styles.separator}></View>
          <View style={styles.fleelingContainer}>
              <IconComponent size={24} color={currentColor}/>
              <Text style={styles.feelingLabel}>{currentLabel}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => onDelete(item.id)}
        >
          <AntDesign name="close" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // --- CARTE D'ENTRÉE ---
  entryCard: {
    display: 'flex',
    backgroundColor: colors.paperBright,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10
  },
  entryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 22,
    fontFamily: fonts.handwritingBold,
    color: colors.ink,
    flex: 1,
    flexWrap: 'wrap',
  },
  entryDate: {
    fontSize: 18,
    color: colors.muted,
    marginLeft: 10,
    fontFamily: fonts.handwriting,
  },
  entryFeeling: {
    fontSize: 14,
    color: '#60a5fa', // Bleu clair
    marginBottom: 8,
    fontWeight: '500',
  },
  fleelingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingRight: 10
  },
  entryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    gap: 5
  },
  entryTitleContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  deleteBtn: {
    padding: 4,
  },
  feelingLabel: {
    color: colors.muted,
    fontFamily: fonts.handwritingBold,
    fontSize: 16,
    marginLeft: 8,
    padding: 2
  },
  separator: { 
    height: "auto",
    backgroundColor: colors.line,
    width: 1,
    marginRight: 10
  },
});