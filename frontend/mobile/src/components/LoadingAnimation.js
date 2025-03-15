import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";

const LoadingAnimation = () => {
    const scaleAnims = [
        useRef(new Animated.Value(1)).current,
        useRef(new Animated.Value(1)).current,
        useRef(new Animated.Value(1)).current,
    ];

    useEffect(() => {
        const createPulseAnimation = (animatedValue, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1.5,
                        duration: 400,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 400,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ]),
                { delay }
            );
        };

        createPulseAnimation(scaleAnims[0], 0).start();
        createPulseAnimation(scaleAnims[1], 400).start();
        createPulseAnimation(scaleAnims[2], 800).start();
    }, []);

    return (
        <View style={styles.container}>
            {scaleAnims.map((anim, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.circle,
                        { transform: [{ scale: anim }] },
                        {
                            backgroundColor: ["#00b4d8", "#90e0ef", "#ff006e"][
                                index
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = {
    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        margin: 5,
    },
};

export default LoadingAnimation;
