import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    useTheme,
    Card,
    Avatar,
    Snackbar,
    SegmentedButtons,
    Divider,
} from 'react-native-paper';
import { useCreateSettlementMutation } from '@api/settlementsApi';
import { useAppSelector } from '@hooks/redux';
import { spacing } from '@theme';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash', icon: 'cash' },
    { value: 'bank_transfer', label: 'Bank', icon: 'bank' },
    { value: 'upi', label: 'UPI', icon: 'cellphone' },
    { value: 'other', label: 'Other', icon: 'dots-horizontal' },
];

export const SettleUpScreen = ({ navigation, route }: any) => {
    const { groupId, payeeId, payeeName, amount: suggestedAmount } = route.params || {};
    const theme = useTheme();
    const currentUser = useAppSelector((state: any) => state.auth.user);

    const [amount, setAmount] = useState(suggestedAmount?.toFixed(2) || '');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [createSettlement, { isLoading }] = useCreateSettlementMutation();

    const handleSettle = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (!payeeId) {
            setError('Payee not specified');
            return;
        }

        try {
            setError('');
            await createSettlement({
                groupId,
                payerId: currentUser?.id,
                payeeId,
                amount: numAmount,
                currency: 'USD',
                paymentMethod,
                notes: notes.trim() || undefined,
            }).unwrap();

            setSuccess(true);
            setTimeout(() => navigation.goBack(), 1500);
        } catch (err: any) {
            setError(err?.data?.error?.message || 'Failed to record settlement');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Settlement Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content style={styles.summaryContent}>
                        <View style={styles.avatarRow}>
                            <View style={styles.avatarItem}>
                                <Avatar.Text
                                    size={52}
                                    label={(currentUser?.name || 'Y').charAt(0).toUpperCase()}
                                    style={{ backgroundColor: theme.colors.primaryContainer }}
                                />
                                <Text variant="labelMedium" style={{ marginTop: 4 }}>
                                    {currentUser?.name || 'You'}
                                </Text>
                            </View>

                            <View style={styles.arrowContainer}>
                                <Text style={[styles.arrow, { color: theme.colors.primary }]}>→</Text>
                                <Text
                                    variant="bodySmall"
                                    style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
                                >
                                    paying
                                </Text>
                            </View>

                            <View style={styles.avatarItem}>
                                <Avatar.Text
                                    size={52}
                                    label={(payeeName || 'P').charAt(0).toUpperCase()}
                                    style={{ backgroundColor: theme.colors.secondaryContainer }}
                                />
                                <Text variant="labelMedium" style={{ marginTop: 4 }}>
                                    {payeeName || 'Payee'}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Amount */}
                <Text variant="titleMedium" style={styles.label}>Amount</Text>
                <TextInput
                    mode="outlined"
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    left={<TextInput.Affix text="$" />}
                    style={styles.input}
                    error={!!error && !parseFloat(amount)}
                />

                {suggestedAmount && (
                    <Button
                        mode="text"
                        compact
                        onPress={() => setAmount(suggestedAmount.toFixed(2))}
                        style={{ alignSelf: 'flex-start', marginTop: -8 }}
                    >
                        Use full amount: ${suggestedAmount.toFixed(2)}
                    </Button>
                )}

                <Divider style={styles.divider} />

                {/* Payment Method */}
                <Text variant="titleMedium" style={styles.label}>Payment Method</Text>
                <SegmentedButtons
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    buttons={PAYMENT_METHODS}
                    style={styles.segmented}
                />

                <Divider style={styles.divider} />

                {/* Notes */}
                <Text variant="titleMedium" style={styles.label}>Notes (optional)</Text>
                <TextInput
                    mode="outlined"
                    label="Add a note"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={2}
                    style={styles.input}
                />

                {error ? (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
                ) : null}

                <Button
                    mode="contained"
                    onPress={handleSettle}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitButton}
                    icon="check"
                >
                    {isLoading ? 'Recording...' : 'Record Settlement'}
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: spacing.sm }}
                >
                    Cancel
                </Button>
            </ScrollView>

            <Snackbar
                visible={success}
                onDismiss={() => setSuccess(false)}
                duration={1500}
            >
                ✅ Settlement recorded!
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
    summaryCard: { marginBottom: spacing.lg },
    summaryContent: { alignItems: 'center', paddingVertical: spacing.md },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },
    avatarItem: { alignItems: 'center' },
    arrowContainer: { alignItems: 'center' },
    arrow: { fontSize: 32, fontWeight: 'bold' },
    label: { marginBottom: spacing.sm, fontWeight: '600' },
    input: { marginBottom: spacing.sm },
    segmented: { marginBottom: spacing.sm },
    divider: { marginVertical: spacing.md },
    errorText: { marginBottom: spacing.sm, fontSize: 13 },
    submitButton: { marginTop: spacing.md },
});
