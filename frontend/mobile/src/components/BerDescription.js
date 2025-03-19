import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";

const BerDescription = ({ visible, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
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

                <Text style={styles.modalTitle}>What is BER?</Text>

                {/* Description Content */}
                <View style={styles.descriptionWrapper}>
                    <Text style={styles.descriptionText}>
                        The BER (Building Energy Rating) measures the energy
                        efficiency of a building, rated from A1 (best) to G
                        (worst). While uploading a certificate is not required
                        to create a publican account, pubs with a verified
                        certificate will be promoted more.
                    </Text>
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
        width: "70%",
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
        marginBottom: 0,
    },
    descriptionWrapper: {
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    descriptionText: {
        fontSize: 14,
        color: "#212529",
        textAlign: "left",
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

export default BerDescription;
