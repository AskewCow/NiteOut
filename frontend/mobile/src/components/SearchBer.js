import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { closeIconXml } from "../utils/closeIcon";
import { leafIconXml } from "../utils/leafIcon";

const SearchBer = ({ visible, onClose }) => {
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
                    <SvgXml xml={closeIconXml} width={23} height={23} />
                </TouchableOpacity>

                <View style={styles.iconTitleRow}>
                    <SvgXml xml={leafIconXml} width={20} height={20} />
                    <Text style={styles.modalTitle}> BER Rating </Text>
                    <SvgXml xml={leafIconXml} width={20} height={20} />
                </View>

                {/* Description Content */}
                <View style={styles.descriptionWrapper}>
                    <Text style={styles.descriptionText}>
                        This pub has a green leaf icon because it has a low BER
                        rating (A1–B2), indicating high energy efficiency. We
                        highlight these pubs as more sustainable and
                        environmentally friendly choices for your night out.
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
    iconTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
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
        zIndex: 2,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default SearchBer;
