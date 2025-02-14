import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";

const MapTags = ({ tags = [], onSelectedTag }) => {
    const [selectedTag, setSelectedTag] = useState(null);

    const handlePressedTag = (tag) => {
        setSelectedTag(tag);
        if(onSelectedTag) {
            onSelectedTag(tag); 
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContainer}>
                {tags.map((tag, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.button,
                            selectedTag === tag ? styles.selectedButton : null,
                            selectedTag === tag ? styles.selectedText : null,
                        ]}                        
                        onPress={() => handlePressedTag(tag)}
                    >
                        <Text style={[styles.buttonText, selectedTag === tag && styles.selectedText]}>
                            {tag}
                        </Text>
                    </TouchableOpacity>
                ))};
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: '10%',
    }, 
    scrollContainer: {
        paddingHorizontal: 10,
    },
    button: {
        paddingVertical: 0,
        paddingHorizontal: 16,
        borderRadius: 15,
        backgroundColor: "#FBDBE9",
        justifyContent: 'center',
        marginRight: 8,
    },
    selectedButton: {
        backgroundColor: "#FF006E",
    },
    buttonText: {
        fontSize: 14,
        justifyContent: 'flex-start',
        color: "#000000",
    },
    selectedText: {
        color: "#FBDBE9",
    },
});

export default MapTags;