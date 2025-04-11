import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";

export const getColorForRating = (rating) => {
  if (rating.startsWith("A")) return "#299660";
  if (rating.startsWith("B")) return "#59ba5b";
  if (rating.startsWith("C")) return "#b7d92d";
  if (rating.startsWith("D")) return "#f8f01d";
  if (rating.startsWith("E")) return "#f8c025";
  if (rating === "F") return "#fe702c";
  if (rating === "G") return "#ef1f27";
  return "grey"; // Default for N/A or unknown
};

const BerPicker = ({ visible, selectedValue, onValueChange, onClose }) => {
  const berRatings = [
    "N/A",
    "A1",
    "A2",
    "A3",
    "B1",
    "B2",
    "B3",
    "C1",
    "C2",
    "C3",
    "D1",
    "D2",
    "E1",
    "E2",
    "F",
    "G",
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onValueChange(item);
        onClose();
      }}
    >
      <Text
        style={[
          styles.itemText,
          selectedValue === item && styles.selectedItemText,
          { fontWeight: "bold", color: getColorForRating(item) },
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>

        <Text style={styles.modalTitle}>BER</Text>

        {/* Scrollable List */}
        <View style={styles.listWrapper}>
          <FlatList
            data={berRatings}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: "55%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    color: "#FF006E",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  listWrapper: {
    maxHeight: 250,
    position: "relative",
  },
  listContainer: {
    paddingVertical: 10,
    paddingBottom: 20,
  },
  item: {
    paddingVertical: 12,
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    color: "#212529",
  },
  selectedItemText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF007A",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default BerPicker;
