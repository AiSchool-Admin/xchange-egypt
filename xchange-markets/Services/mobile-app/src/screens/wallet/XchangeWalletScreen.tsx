// ============================================
// Xchange Wallet Screen - المحفظة الرقمية
// Wallet with Egyptian Payment Methods
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  I18nManager,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Divider,
  Portal,
  Modal,
  TextInput,
  SegmentedButtons,
  ActivityIndicator,
  IconButton,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

import { useSettingsStore } from '../../store/settingsStore';
import { theme } from '../../constants/theme';
import { walletApi, Transaction, Wallet, PaymentMethod } from '../../services/api/wallet';

const { width: screenWidth } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

// Payment method icons
const paymentMethodIcons: Record<string, string> = {
  WALLET: 'wallet',
  CARD: 'card',
  FAWRY: 'receipt',
  VODAFONE_CASH: 'phone-portrait',
  INSTAPAY: 'flash',
  BANK_ACCOUNT: 'business',
};

// Transaction type colors
const transactionTypeColors: Record<string, string> = {
  DEPOSIT: '#4CAF50',
  WITHDRAWAL: '#FF9800',
  PAYMENT: '#E91E63',
  REFUND: '#2196F3',
  ESCROW_HOLD: '#9C27B0',
  ESCROW_RELEASE: '#4CAF50',
  COMMISSION: '#607D8B',
};

// Transaction type icons
const transactionTypeIcons: Record<string, string> = {
  DEPOSIT: 'arrow-down-circle',
  WITHDRAWAL: 'arrow-up-circle',
  PAYMENT: 'cart',
  REFUND: 'refresh-circle',
  ESCROW_HOLD: 'lock-closed',
  ESCROW_RELEASE: 'lock-open',
  COMMISSION: 'cash',
};

interface DepositModalProps {
  visible: boolean;
  onDismiss: () => void;
  onDeposit: (amount: number, method: string) => void;
  isLoading: boolean;
}

function DepositModal({ visible, onDismiss, onDeposit, isLoading }: DepositModalProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('FAWRY');

  const quickAmounts = [100, 500, 1000, 5000];

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount >= 10) {
      onDeposit(numAmount, method);
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface },
      ]}
    >
      <Text style={styles.modalTitle}>{t('wallet.deposit.title', 'إيداع رصيد')}</Text>

      <TextInput
        label={t('wallet.amount', 'المبلغ')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        right={<TextInput.Affix text="EGP" />}
        style={styles.input}
      />

      <View style={styles.quickAmountsContainer}>
        {quickAmounts.map((quickAmount) => (
          <Chip
            key={quickAmount}
            onPress={() => setAmount(quickAmount.toString())}
            selected={amount === quickAmount.toString()}
            style={styles.quickAmountChip}
          >
            {quickAmount.toLocaleString()} جنيه
          </Chip>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t('wallet.deposit.method', 'طريقة الإيداع')}</Text>

      <SegmentedButtons
        value={method}
        onValueChange={setMethod}
        buttons={[
          { value: 'FAWRY', label: 'فوري' },
          { value: 'VODAFONE_CASH', label: 'فودافون كاش' },
          { value: 'INSTAPAY', label: 'إنستاباي' },
        ]}
        style={styles.segmentedButtons}
      />

      <Button
        mode="contained"
        onPress={handleDeposit}
        loading={isLoading}
        disabled={!amount || parseFloat(amount) < 10 || isLoading}
        style={styles.modalButton}
      >
        {t('wallet.deposit.confirm', 'إيداع الآن')}
      </Button>
    </Modal>
  );
}

interface WithdrawModalProps {
  visible: boolean;
  onDismiss: () => void;
  onWithdraw: (amount: number, method: string, accountDetails: any) => void;
  isLoading: boolean;
  balance: number;
}

function WithdrawModal({ visible, onDismiss, onWithdraw, isLoading, balance }: WithdrawModalProps) {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_ACCOUNT');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (numAmount >= 50 && numAmount <= balance) {
      onWithdraw(numAmount, method, {
        bankName,
        accountNumber,
        accountName,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface },
      ]}
    >
      <Text style={styles.modalTitle}>{t('wallet.withdraw.title', 'سحب رصيد')}</Text>

      <Text style={styles.balanceHint}>
        {t('wallet.availableBalance', 'الرصيد المتاح')}: {balance.toLocaleString()} جنيه
      </Text>

      <TextInput
        label={t('wallet.amount', 'المبلغ')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        right={<TextInput.Affix text="EGP" />}
        style={styles.input}
      />

      <SegmentedButtons
        value={method}
        onValueChange={setMethod}
        buttons={[
          { value: 'BANK_ACCOUNT', label: 'حساب بنكي' },
          { value: 'VODAFONE_CASH', label: 'فودافون كاش' },
          { value: 'INSTAPAY', label: 'إنستاباي' },
        ]}
        style={styles.segmentedButtons}
      />

      {method === 'BANK_ACCOUNT' && (
        <>
          <TextInput
            label={t('wallet.withdraw.bankName', 'اسم البنك')}
            value={bankName}
            onChangeText={setBankName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={t('wallet.withdraw.accountNumber', 'رقم الحساب')}
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={t('wallet.withdraw.accountName', 'اسم صاحب الحساب')}
            value={accountName}
            onChangeText={setAccountName}
            mode="outlined"
            style={styles.input}
          />
        </>
      )}

      {method === 'VODAFONE_CASH' && (
        <TextInput
          label={t('wallet.withdraw.phoneNumber', 'رقم الموبايل')}
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
        />
      )}

      <Button
        mode="contained"
        onPress={handleWithdraw}
        loading={isLoading}
        disabled={!amount || parseFloat(amount) < 50 || parseFloat(amount) > balance || isLoading}
        style={styles.modalButton}
      >
        {t('wallet.withdraw.confirm', 'سحب الآن')}
      </Button>
    </Modal>
  );
}

export default function XchangeWalletScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const { isDarkMode, language } = useSettingsStore();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [summaryPeriod, setSummaryPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const dateLocale = language === 'ar' ? ar : enUS;

  // Fetch wallet
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });

  // Fetch balance
  const { data: balance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletApi.getBalance,
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletApi.getTransactions({}, 1, 10),
  });

  // Fetch summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['wallet-summary', summaryPeriod],
    queryFn: () => walletApi.getWalletSummary(summaryPeriod),
  });

  // Fetch escrows
  const { data: escrows } = useQuery({
    queryKey: ['active-escrows'],
    queryFn: walletApi.getActiveEscrows,
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: (data: { amount: number; method: string }) =>
      walletApi.initiateDeposit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      setDepositModalVisible(false);
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number; method: string; accountDetails: any }) =>
      walletApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      setWithdrawModalVisible(false);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['wallet'] }),
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] }),
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  // Chart data
  const chartData = useMemo(() => {
    if (!summary?.chartData) return null;

    const labels = summary.chartData.slice(-7).map((item) =>
      format(new Date(item.date), 'dd/MM', { locale: dateLocale })
    );
    const data = summary.chartData.slice(-7).map((item) => item.balance);

    return {
      labels,
      datasets: [{ data }],
    };
  }, [summary?.chartData, dateLocale]);

  const renderTransactionItem = (transaction: Transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
    >
      <View style={[styles.transactionIcon, { backgroundColor: transactionTypeColors[transaction.type] + '20' }]}>
        <Ionicons
          name={transactionTypeIcons[transaction.type] as any}
          size={24}
          color={transactionTypeColors[transaction.type]}
        />
      </View>

      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionTitle, isDarkMode && styles.textDark]}>
          {language === 'ar' && transaction.descriptionAr ? transaction.descriptionAr : transaction.description}
        </Text>
        <Text style={styles.transactionDate}>
          {format(new Date(transaction.createdAt), 'dd MMM yyyy - HH:mm', { locale: dateLocale })}
        </Text>
      </View>

      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amountText,
            { color: ['DEPOSIT', 'REFUND', 'ESCROW_RELEASE'].includes(transaction.type) ? '#4CAF50' : '#E91E63' },
          ]}
        >
          {['DEPOSIT', 'REFUND', 'ESCROW_RELEASE'].includes(transaction.type) ? '+' : '-'}
          {transaction.amount.toLocaleString()} ج.م
        </Text>
        <Chip
          mode="flat"
          compact
          style={[
            styles.statusChip,
            {
              backgroundColor:
                transaction.status === 'COMPLETED' ? '#4CAF5020' :
                transaction.status === 'PENDING' ? '#FF980020' :
                '#F4433620',
            },
          ]}
          textStyle={{
            fontSize: 10,
            color:
              transaction.status === 'COMPLETED' ? '#4CAF50' :
              transaction.status === 'PENDING' ? '#FF9800' :
              '#F44336',
          }}
        >
          {transaction.status === 'COMPLETED' ? 'مكتمل' :
           transaction.status === 'PENDING' ? 'قيد الانتظار' :
           'ملغي'}
        </Chip>
      </View>
    </TouchableOpacity>
  );

  if (walletLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Balance Card */}
        <Card style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
          <Card.Content>
            <Text style={styles.balanceLabel}>{t('wallet.balance', 'الرصيد الحالي')}</Text>
            <Text style={styles.balanceAmount}>
              {(balance?.balance ?? wallet?.balance ?? 0).toLocaleString()} <Text style={styles.currency}>ج.م</Text>
            </Text>

            {balance?.pending ? (
              <View style={styles.pendingContainer}>
                <Ionicons name="time-outline" size={16} color="#fff" />
                <Text style={styles.pendingText}>
                  {t('wallet.pendingBalance', 'رصيد معلق')}: {balance.pending.toLocaleString()} ج.م
                </Text>
              </View>
            ) : null}

            <View style={styles.balanceActions}>
              <Button
                mode="contained"
                onPress={() => setDepositModalVisible(true)}
                icon="arrow-down"
                style={styles.actionButton}
                buttonColor="#fff"
                textColor={theme.colors.primary}
              >
                {t('wallet.deposit.button', 'إيداع')}
              </Button>

              <Button
                mode="outlined"
                onPress={() => setWithdrawModalVisible(true)}
                icon="arrow-up"
                style={styles.actionButton}
                textColor="#fff"
              >
                {t('wallet.withdraw.button', 'سحب')}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Summary Stats */}
        {summary && (
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                {t('wallet.summary', 'ملخص المحفظة')}
              </Text>
              <SegmentedButtons
                value={summaryPeriod}
                onValueChange={(v) => setSummaryPeriod(v as any)}
                buttons={[
                  { value: '7d', label: '7 أيام' },
                  { value: '30d', label: '30 يوم' },
                  { value: '90d', label: '3 شهور' },
                ]}
                density="small"
                style={styles.periodSelector}
              />
            </View>

            <View style={styles.statsGrid}>
              <Surface style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                <Ionicons name="arrow-down-circle" size={24} color="#4CAF50" />
                <Text style={styles.statLabel}>{t('wallet.totalDeposits', 'إجمالي الإيداعات')}</Text>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                  {summary.totalDeposits.toLocaleString()} ج.م
                </Text>
              </Surface>

              <Surface style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                <Ionicons name="arrow-up-circle" size={24} color="#FF9800" />
                <Text style={styles.statLabel}>{t('wallet.totalWithdrawals', 'إجمالي السحب')}</Text>
                <Text style={[styles.statValue, { color: '#FF9800' }]}>
                  {summary.totalWithdrawals.toLocaleString()} ج.م
                </Text>
              </Surface>

              <Surface style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                <Ionicons name="cart" size={24} color="#E91E63" />
                <Text style={styles.statLabel}>{t('wallet.totalSpent', 'إجمالي المشتريات')}</Text>
                <Text style={[styles.statValue, { color: '#E91E63' }]}>
                  {summary.totalSpent.toLocaleString()} ج.م
                </Text>
              </Surface>

              <Surface style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                <Ionicons name="cash" size={24} color="#2196F3" />
                <Text style={styles.statLabel}>{t('wallet.totalEarned', 'إجمالي الأرباح')}</Text>
                <Text style={[styles.statValue, { color: '#2196F3' }]}>
                  {summary.totalEarned.toLocaleString()} ج.م
                </Text>
              </Surface>
            </View>

            {/* Balance Chart */}
            {chartData && chartData.datasets[0].data.length > 0 && (
              <Card style={[styles.chartCard, isDarkMode && styles.cardDark]}>
                <Card.Content>
                  <Text style={[styles.chartTitle, isDarkMode && styles.textDark]}>
                    {t('wallet.balanceHistory', 'سجل الرصيد')}
                  </Text>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 64}
                    height={180}
                    chartConfig={{
                      backgroundColor: isDarkMode ? theme.colors.surfaceDark : '#fff',
                      backgroundGradientFrom: isDarkMode ? theme.colors.surfaceDark : '#fff',
                      backgroundGradientTo: isDarkMode ? theme.colors.surfaceDark : '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: theme.colors.primary,
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {/* Active Escrows */}
        {escrows && escrows.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
                {t('wallet.escrows', 'الرصيد المحتجز')}
              </Text>
              <Chip mode="outlined" compact>
                {escrows.length} {t('wallet.active', 'نشط')}
              </Chip>
            </View>

            {escrows.map((escrow) => (
              <Card key={escrow.id} style={[styles.escrowCard, isDarkMode && styles.cardDark]}>
                <Card.Content style={styles.escrowContent}>
                  <View style={styles.escrowIcon}>
                    <Ionicons name="lock-closed" size={24} color="#9C27B0" />
                  </View>
                  <View style={styles.escrowInfo}>
                    <Text style={[styles.escrowAmount, isDarkMode && styles.textDark]}>
                      {escrow.amount.toLocaleString()} ج.م
                    </Text>
                    <Text style={styles.escrowOrder}>
                      طلب #{escrow.orderId.slice(-6)}
                    </Text>
                    <Text style={styles.escrowExpiry}>
                      ينتهي: {format(new Date(escrow.expiresAt), 'dd MMM yyyy', { locale: dateLocale })}
                    </Text>
                  </View>
                  <Chip
                    mode="flat"
                    style={{ backgroundColor: '#9C27B020' }}
                    textStyle={{ color: '#9C27B0', fontSize: 11 }}
                  >
                    محتجز
                  </Chip>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
              {t('wallet.recentTransactions', 'المعاملات الأخيرة')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={styles.viewAllLink}>{t('common.viewAll', 'عرض الكل')}</Text>
            </TouchableOpacity>
          </View>

          <Card style={[styles.transactionsCard, isDarkMode && styles.cardDark]}>
            {transactionsLoading ? (
              <ActivityIndicator style={{ padding: 24 }} color={theme.colors.primary} />
            ) : transactionsData?.data?.length ? (
              transactionsData.data.map(renderTransactionItem)
            ) : (
              <View style={styles.emptyTransactions}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={isDarkMode ? theme.colors.textSecondaryDark : theme.colors.textSecondary}
                />
                <Text style={styles.emptyText}>
                  {t('wallet.noTransactions', 'لا توجد معاملات حتى الآن')}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            {t('wallet.quickActions', 'إجراءات سريعة')}
          </Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickAction, isDarkMode && styles.quickActionDark]}
              onPress={() => navigation.navigate('Listings')}
            >
              <Ionicons name="storefront-outline" size={28} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, isDarkMode && styles.textDark]}>
                {t('wallet.buyNow', 'تسوق الآن')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, isDarkMode && styles.quickActionDark]}
              onPress={() => navigation.navigate('Auctions')}
            >
              <Ionicons name="hammer-outline" size={28} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, isDarkMode && styles.textDark]}>
                {t('wallet.auctions', 'المزادات')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, isDarkMode && styles.quickActionDark]}
              onPress={() => navigation.navigate('Gold')}
            >
              <Ionicons name="diamond-outline" size={28} color="#FFD700" />
              <Text style={[styles.quickActionText, isDarkMode && styles.textDark]}>
                {t('wallet.gold', 'الذهب')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, isDarkMode && styles.quickActionDark]}
              onPress={() => navigation.navigate('TransferMoney')}
            >
              <Ionicons name="swap-horizontal-outline" size={28} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, isDarkMode && styles.textDark]}>
                {t('wallet.transfer', 'تحويل')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <Portal>
        <DepositModal
          visible={depositModalVisible}
          onDismiss={() => setDepositModalVisible(false)}
          onDeposit={(amount, method) => depositMutation.mutate({ amount, method })}
          isLoading={depositMutation.isPending}
        />

        <WithdrawModal
          visible={withdrawModalVisible}
          onDismiss={() => setWithdrawModalVisible(false)}
          onWithdraw={(amount, method, accountDetails) =>
            withdrawMutation.mutate({ amount, method, accountDetails })
          }
          isLoading={withdrawMutation.isPending}
          balance={balance?.balance ?? wallet?.balance ?? 0}
        />
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerDark: {
    backgroundColor: theme.colors.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Balance Card
  balanceCard: {
    margin: 16,
    borderRadius: 16,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  currency: {
    fontSize: 20,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  pendingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    marginLeft: 4,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    minWidth: 120,
  },

  // Summary Section
  summarySection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-SemiBold',
    color: theme.colors.text,
  },
  periodSelector: {
    maxWidth: 220,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: theme.colors.surfaceDark,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    marginTop: 4,
  },

  // Chart
  chartCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  cardDark: {
    backgroundColor: theme.colors.surfaceDark,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  chart: {
    borderRadius: 12,
  },

  // Section
  section: {
    marginTop: 16,
    marginBottom: 8,
  },

  // Escrow
  escrowCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  escrowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  escrowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9C27B020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  escrowInfo: {
    flex: 1,
  },
  escrowAmount: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: theme.colors.text,
  },
  escrowOrder: {
    fontSize: 13,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
  },
  escrowExpiry: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
  },

  // Transactions
  transactionsCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    color: theme.colors.text,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontFamily: 'Cairo-Bold',
  },
  statusChip: {
    marginTop: 4,
    height: 22,
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  viewAllLink: {
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    color: theme.colors.primary,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  quickActionDark: {
    backgroundColor: theme.colors.surfaceDark,
  },
  quickActionText: {
    fontSize: 13,
    fontFamily: 'Cairo-Medium',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  textDark: {
    color: theme.colors.textDark,
  },

  // Modal
  modalContainer: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickAmountChip: {
    marginRight: 4,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  modalButton: {
    marginTop: 8,
  },
  balanceHint: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
