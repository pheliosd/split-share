import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import {
    Text,
    Card,
    Button,
    useTheme,
    ActivityIndicator,
    Divider,
    Avatar,
    FAB,
    SegmentedButtons,
} from 'react-native-paper';
import { useGetGroupBalancesQuery, useGetGroupsQuery } from '@api/groupsApi';
import { useGetSettlementsQuery } from '@api/settlementsApi';
import { useAppSelector } from '@hooks/redux';
import { spacing } from '@theme';
import { format } from 'date-fns';
import { EmptyState } from '@components/EmptyState';
import { LoadingList } from '@components/LoadingSkeleton';

export const BalancesScreen = ({ navigation, route }: any) => {
    const { groupId } = route.params || {};
    const theme = useTheme();
    const currentUser = useAppSelector((state: any) => state.auth.user);
    const [view, setView] = useState<'balances' | 'history'>('balances');
    const [refreshing, setRefreshing] = useState(false);

    const {
        data: balancesData,
        isLoading: balancesLoading,
        refetch: refetchBalances,
    } = useGetGroupBalancesQuery(groupId, { skip: !groupId });

    const {
        data: settlementsData,
        isLoading: settlementsLoading,
        refetch: refetchSettlements,
    } = useGetSettlementsQuery({ groupId, limit: 50 });

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchBalances(), refetchSettlements()]);
        setRefreshing(false);
    };

    const isLoading = balancesLoading || settlementsLoading;

    if (isLoading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <LoadingList count={4} />
            </View>
        );
    }

    const balances = balancesData?.balances || [];
    const settlements = settlementsData?.settlements || [];

    // Separate into "you owe" and "owed to you"
    const myBalances = balances.filter((b: any) => b.userId === currentUser?.id);
    const positiveBalances = balances.filter((b: any) => parseFloat(b.balance) > 0);
    const negativeBalances = balances.filter((b: any) => parseFloat(b.balance) < 0);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <SegmentedButtons
                value={view}
                onValueChange={(v) => setView(v as any)}
                buttons={[
                    { value: 'balances', label: 'Balances', icon: 'scale-balance' },
                    { value: 'history', label: 'History', icon: 'history' },
                ]}
                style={styles.segmented}
            />

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {view === 'balances' ? (
                    <>
                        {/* Owed to others */}
                        {negativeBalances.length > 0 && (
                            <View style={styles.section}>
                                <Text
                                    variant="titleSmall"
                                    style={[styles.sectionLabel, { color: theme.colors.error }]}
                                >
                                    YOU OWE
                                </Text>
                                {negativeBalances.map((balance: any, i: number) => (
                                    <Card key={i} style={styles.balanceCard}>
                                        <Card.Content style={styles.balanceRow}>
                                            <View style={styles.personRow}>
                                                <Avatar.Text
                                                    size={40}
                                                    label={(balance.userName || 'U').charAt(0).toUpperCase()}
                                                    style={{ backgroundColor: theme.colors.errorContainer }}
                                                />
                                                <View style={{ marginLeft: 12 }}>
                                                    <Text variant="titleMedium">{balance.userName}</Text>
                                                    <Text
                                                        variant="bodySmall"
                                                        style={{ color: theme.colors.onSurfaceVariant }}
                                                    >
                                                        you owe them
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text
                                                    variant="titleMedium"
                                                    style={{ color: theme.colors.error, fontWeight: 'bold' }}
                                                >
                                                    ${Math.abs(parseFloat(balance.balance)).toFixed(2)}
                                                </Text>
                                                <Button
                                                    mode="contained-tonal"
                                                    compact
                                                    onPress={() =>
                                                        navigation.navigate('SettleUp', {
                                                            groupId,
                                                            payeeId: balance.userId,
                                                            payeeName: balance.userName,
                                                            amount: Math.abs(parseFloat(balance.balance)),
                                                        })
                                                    }
                                                    style={{ marginTop: 4 }}
                                                >
                                                    Settle
                                                </Button>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                ))}
                            </View>
                        )}

                        {/* Owed by others */}
                        {positiveBalances.length > 0 && (
                            <View style={styles.section}>
                                <Text
                                    variant="titleSmall"
                                    style={[styles.sectionLabel, { color: theme.colors.primary }]}
                                >
                                    OWED TO YOU
                                </Text>
                                {positiveBalances.map((balance: any, i: number) => (
                                    <Card key={i} style={styles.balanceCard}>
                                        <Card.Content style={styles.balanceRow}>
                                            <View style={styles.personRow}>
                                                <Avatar.Text
                                                    size={40}
                                                    label={(balance.userName || 'U').charAt(0).toUpperCase()}
                                                    style={{ backgroundColor: theme.colors.primaryContainer }}
                                                />
                                                <View style={{ marginLeft: 12 }}>
                                                    <Text variant="titleMedium">{balance.userName}</Text>
                                                    <Text
                                                        variant="bodySmall"
                                                        style={{ color: theme.colors.onSurfaceVariant }}
                                                    >
                                                        owes you
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text
                                                variant="titleMedium"
                                                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                                            >
                                                ${parseFloat(balance.balance).toFixed(2)}
                                            </Text>
                                        </Card.Content>
                                    </Card>
                                ))}
                            </View>
                        )}

                        {balances.length === 0 && (
                            <EmptyState
                                icon="check-circle-outline"
                                title="All settled up!"
                                description="No outstanding balances in this group."
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Text variant="titleSmall" style={styles.sectionLabel}>
                            SETTLEMENT HISTORY
                        </Text>
                        {settlements.length > 0 ? (
                            settlements.map((s: any, i: number) => (
                                <Card key={i} style={styles.balanceCard}>
                                    <Card.Content>
                                        <View style={styles.balanceRow}>
                                            <View style={styles.personRow}>
                                                <Avatar.Icon
                                                    size={36}
                                                    icon="bank-transfer"
                                                    style={{ backgroundColor: theme.colors.secondaryContainer }}
                                                />
                                                <View style={{ marginLeft: 10 }}>
                                                    <Text variant="bodyMedium">
                                                        <Text style={{ fontWeight: '600' }}>{s.payer?.name}</Text>
                                                        {' → '}
                                                        <Text style={{ fontWeight: '600' }}>{s.payee?.name}</Text>
                                                    </Text>
                                                    <Text
                                                        variant="bodySmall"
                                                        style={{ color: theme.colors.onSurfaceVariant }}
                                                    >
                                                        {format(new Date(s.date || s.createdAt), 'MMM d, yyyy')}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                                ${parseFloat(s.amount).toFixed(2)}
                                            </Text>
                                        </View>
                                        {s.notes && (
                                            <Text
                                                variant="bodySmall"
                                                style={{
                                                    color: theme.colors.onSurfaceVariant,
                                                    marginTop: 4,
                                                    marginLeft: 46,
                                                }}
                                            >
                                                {s.notes}
                                            </Text>
                                        )}
                                    </Card.Content>
                                </Card>
                            ))
                        ) : (
                            <EmptyState
                                icon="history"
                                title="No settlements yet"
                                description="Settlements will appear here once recorded."
                            />
                        )}
                    </>
                )}
            </ScrollView>

            {view === 'balances' && negativeBalances.length > 0 && (
                <FAB
                    icon="handshake"
                    label="Settle Up"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() =>
                        navigation.navigate('SettleUp', {
                            groupId,
                            amount: Math.abs(parseFloat(negativeBalances[0]?.balance || '0')),
                            payeeId: negativeBalances[0]?.userId,
                            payeeName: negativeBalances[0]?.userName,
                        })
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    segmented: { margin: spacing.md },
    scrollContent: { paddingBottom: 100 },
    section: { marginBottom: spacing.md },
    sectionLabel: {
        fontWeight: 'bold',
        letterSpacing: 1,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    balanceCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    personRow: { flexDirection: 'row', alignItems: 'center' },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
