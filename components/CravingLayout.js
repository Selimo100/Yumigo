import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import useTabBarHeight from '../hooks/useTabBarHeight';

const CravingLayout = ({ 
    children, 
    title, 
    subtitle, 
    stepNumber, 
    totalSteps, 
    onBack,
    showBackButton = true 
}) => {
    const tabBarHeight = useTabBarHeight();
    const styles = createStyles(tabBarHeight);

    return (
        <SafeAreaView style={styles.container}>
            {showBackButton && (
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {stepNumber && totalSteps ? `Step ${stepNumber} of ${totalSteps}` : ''}
                    </Text>
                    <View style={styles.placeholder} />
                </View>
            )}
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>

                {children}
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (tabBarHeight) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.white 
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: tabBarHeight + 20, 
        alignItems: 'center' 
    },
    header: { 
        alignItems: 'center', 
        marginBottom: 30,
        marginTop: 20
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: COLORS.primary, 
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: { 
        fontSize: 16, 
        color: COLORS.gray,
        textAlign: 'center'
    },
});

export default CravingLayout;
