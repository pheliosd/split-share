import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import {
    Text,
    Card,
    Button,
    useTheme,
    Avatar,
    Divider,
    List,
    Switch,
    Portal,
    Dialog,
    RadioButton,
    Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { logout } from '@store/slices/authSlice';
import { useGetSupportedCurrenciesQuery } from '@api/currencyApi';
import { spacing } from '@theme';

const BACKEND_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'https://your-api.com';

export const ProfileScreen = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const [currencyDialogVisible, setCurrencyDialogVisible] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [darkMode, setDarkMode] = useState(false);
    const [snackbar, setSnackbar] = useState('');

    const { data: currenciesData } = useGetSupportedCurrenciesQuery();
    const currencies = currenciesData?.currencies || [];

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => dispatch(logout()),
            },
        ]);
    };

    const handleExportMyExpenses = () => {
        const token = ''; // would come from auth state
        const url = `${BACKEND_URL}/api/v1/export/my-expenses/csv`;
        Linking.openURL(url).catch(() =>
            setSnackbar('Could not open export link. Please try again.')
        );
        setSnackbar('Export started — check your downloads');
    };

    const handleCurrencyChange = (code: string) => {
        setSelectedCurrency(code);
        setCurrencyDialogVisible(false);
        setSnackbar(`Default currency set to ${code}`);
    };

    const selectedCurrencyInfo = currencies.find((c) => c.code === selectedCurrency);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Profile Header */}
            <Card style={styles.profileCard}>
                <Card.Content style={styles.profileContent}>
                    <Avatar.Text
                        size={72}
                        label={user?.name?.slice(0, 2).toUpperCase() || 'U'}
                        style={{ backgroundColor: theme.colors.primary }}
                    />
                    <Text variant="headlineSmall" style={styles.name}>
                        {user?.name || 'User'}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {user?.email || ''}
                    </Text>
                </Card.Content>
            </Card>

            {/* Preferences */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Preferences</Text>

                    <List.Item
                        title="Default Currency"
                        description={selectedCurrencyInfo
                            ? `${selectedCurrencyInfo.symbol} ${selectedCurrencyInfo.name}`
                            : 'USD'}
                        left={(props) => <List.Icon {...props} icon="currency-usd" />}
                        right={() => (
                            <Text variant="bodyMedium" style={{ color: theme.colors.primary, alignSelf: 'center' }}>
                                {selectedCurrency}
                            </Text>
                        )}
                        onPress={() => setCurrencyDialogVisible(true)}
                    />

                    <Divider />

                    <List.Item
                        title="Dark Mode"
                        description="Toggle dark/light theme"
                        left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                        right={() => (
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                            />
                        )}
                    />
                </Card.Content>
            </Card>

            {/* Data & Export */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Data & Export</Text>

                    <List.Item
                        title="Export My Expenses"
                        description="Download all your expenses as CSV"
                        left={(props) => <List.Icon {...props} icon="file-download-outline" />}
                        onPress={handleExportMyExpenses}
                    />

                    <Divider />

                    <List.Item
                        title="Privacy Policy"
                        description="View our privacy policy"
                        left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
                        onPress={() => setSnackbar('Privacy policy coming soon')}
                    />
                </Card.Content>
            </Card>

            {/* App Info */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
                    <List.Item
                        title="Version"
                        description="1.0.0"
                        left={(props) => <List.Icon {...props} icon="information-outline" />}
                    />
                </Card.Content>
            </Card>

            {/* Logout */}
            <Button
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                textColor={theme.colors.error}
                icon="logout"
            >
                Logout
            </Button>

            {/* Currency Dialog */}
            <Portal>
                <Dialog
                    visible={currencyDialogVisible}
                    onDismiss={() => setCurrencyDialogVisible(false)}
                >
                    <Dialog.Title>Select Default Currency</Dialog.Title>
                    <Dialog.ScrollArea style={{ maxHeight: 300 }}>
                        <ScrollView>
                            <RadioButton.Group
                                value={selectedCurrency}
                                onValueChange={handleCurrencyChange}
                            >
                                {currencies.map((currency) => (
                                    <RadioButton.Item
                                        key={currency.code}
                                        label={`${currency.symbol} ${currency.name} (${currency.code})`}
                                        value={currency.code}
                                    />
                                ))}
                            </RadioButton.Group>
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setCurrencyDialogVisible(false)}>Cancel</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Snackbar
                visible={!!snackbar}
                onDismiss={() => setSnackbar('')}
                duration={3000}
            >
                {snackbar}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    profileCard: { margin: spacing.md },
    profileContent: { alignItems: 'center', paddingVertical: spacing.lg },
    name: { marginTop: spacing.md, fontWeight: 'bold' },
    card: { marginHorizontal: spacing.md, marginBottom: spacing.md },
    sectionTitle: { marginBottom: spacing.sm, fontWeight: 'bold' },
    logoutButton: {
        margin: spacing.md,
        marginBottom: spacing.xl,
        borderColor: 'red',
    },
});
