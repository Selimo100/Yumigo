import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS } from '../../utils/constants';
import { smartButton, smartShadow, smartBorder, androidStyleCleanup } from '../../utils/platformStyles';

const CravingSelector = ({ 
    item, 
    isSelected, 
    onPress, 
    style = {},
    useGridLayout = false // Neuer Prop für Grid-basierte Nutzung
}) => {
    const scaleValue = new Animated.Value(isSelected ? 1.02 : 1);

    React.useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: isSelected ? 1.02 : 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    }, [isSelected]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                style={[
                    useGridLayout ? styles.gridButton : styles.button,
                    {
                        backgroundColor: isSelected ? COLORS.primary : COLORS.white,
                        ...smartBorder(2, COLORS.primary), // Zeigt Border nur auf iOS
                        shadowColor: COLORS.primary,
                        shadowOpacity: isSelected ? 0.25 : 0.1,
                    },
                    // Nur Android-spezifische Border-Cleanup
                    Platform.OS === 'android' ? androidStyleCleanup(style) : style
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View style={styles.content}>
                    <Text style={[
                        styles.emoji,
                        useGridLayout && styles.gridEmoji
                    ]}>
                        {item.icon}
                    </Text>
                    <Text style={[
                        styles.label, 
                        { color: isSelected ? COLORS.white : COLORS.primary },
                        useGridLayout && styles.gridLabel
                    ]}>
                        {item.label}
                    </Text>
                </View>
                {isSelected && (
                    <View style={[styles.checkmarkWrapper, { backgroundColor: COLORS.white }]}>
                        <Text style={[styles.checkmark, { color: COLORS.primary }]}>✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '47%',
        borderRadius: 16,
        height: 110,
        marginBottom: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        ...smartShadow(
            {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            3
        ),
    },
    gridButton: {
        width: '100%',
        borderRadius: 12,
        aspectRatio: 1,
        padding: Platform.OS === 'ios' ? 12 : 8,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        ...smartShadow(
            {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            3
        ),
    },
    content: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    emoji: {
        fontSize: 28,
        marginBottom: 6,
        textAlign: 'center',
    },
    gridEmoji: {
        fontSize: Platform.OS === 'ios' ? 24 : 22,
        marginBottom: Platform.OS === 'ios' ? 4 : 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
    },
    gridLabel: {
        fontSize: Platform.OS === 'ios' ? 12 : 11,
        fontWeight: Platform.OS === 'ios' ? '600' : '700',
        lineHeight: Platform.OS === 'ios' ? 14 : 13,
    },
    checkmarkWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...smartShadow(
            {
                shadowOffset: { width: 0, height: 1 },
                shadowRadius: 2,
                shadowOpacity: 0.2,
            },
            2
        ),
    },
    checkmark: {
        fontSize: 14,
        fontWeight: '900',
    },
});

export default CravingSelector;
