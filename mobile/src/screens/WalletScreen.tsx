import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBalance, receiveCashuToken, payLightningInvoice, checkInvoiceStatus, createLightningInvoice } from '../services/api';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import Clipboard from '@react-native-clipboard/clipboard';

const TARGET_MINT = 'https://8333.space:3338';

type Tab = 'send' | 'receive';

type MintData = {
  available: number;
  balance: number;
};

type Mint = {
  url: string;
  available: number;
  balance: number;
};

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { loading: steganographyLoading, hideToken } = useSteganography();

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('send');

  const [selectedMint, setSelectedMint] = useState<string>(TARGET_MINT);

  // Receive state
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiveToken, setReceiveToken] = useState('');
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);
  const [receiveResult, setReceiveResult] = useState<string | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<string>('');

  // Pay state
  const [payInvoice, setPayInvoice] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (activeTab === 'send') {
      fetchMints();
    }
  }, [activeTab]);

  const fetchMints = async () => {
    const data = await getBalance();
    if (data.mints) {
      const mintList = Object.entries(data.mints as Record<string, MintData>).map(([url, data]) => ({
        url,
        available: data.available,
        balance: data.balance
      }));
      if (mintList.length > 0) {
        setSelectedMint(mintList[0].url);
      }
    }
  };

  const handleGenerateInvoice = async () => {
    if (!amount) return;
    try {
      const data = await createLightningInvoice(Number(amount), selectedMint);
      const invoice = data.payment_request || data.invoice || JSON.stringify(data);
      setGeneratedInvoice(invoice);

      // 1. Get the initial balance before polling
      const balanceData = await getBalance();
      const initialBalance = balanceData.mints && balanceData.mints[selectedMint]
        ? balanceData.mints[selectedMint].available
        : 0;

      setModalVisible(true);

      // 2. Start polling for invoice status and balance
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes if polling every 5 seconds

      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          // Check invoice status as before
          const status = await checkInvoiceStatus(invoice, selectedMint);

          // Check current balance
          const balanceData = await getBalance();
          const newBalance = balanceData.mints && balanceData.mints[selectedMint]
            ? balanceData.mints[selectedMint].available
            : 0;

          // If invoice is settled or balance increased, stop polling and show success
          if ((status && status.result === 'SETTLED') || newBalance > initialBalance) {
            clearInterval(pollInterval);
            setModalVisible(false);
            Alert.alert('Success!', 'Payment received and tokens claimed', [
              { text: 'OK' }
            ]);
            return;
          }
        } catch (error) {
          clearInterval(pollInterval);
          setModalVisible(false);
          Alert.alert(
            'Error',
            'There was a problem checking the invoice status. Please check your balance manually.'
          );
          return;
        }
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setModalVisible(false);
          Alert.alert('Timeout', 'Invoice polling timed out. Please check your balance manually.');
        }
      }, 5000);

    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate invoice');
    }
  };

  const handleReceive = async () => {
    setReceiveLoading(true);
    setReceiveError(null);
    setReceiveResult(null);
    try {
      const data = await receiveCashuToken(receiveToken);
      // Get new balance after receiving token
      const balanceData = await getBalance();
      const newBalance = balanceData.mints ? (Object.values(balanceData.mints)[0] as { available: number }).available : 0;
      setReceiveResult(`Token redeemed successfully!\nNew Balance: ${newBalance} sat`);
      setReceiveToken('');
    } catch (err: any) {
      setReceiveError(err.message || 'Failed to receive BTC');
    } finally {
      setReceiveLoading(false);
    }
  };

  const handlePayInvoice = async () => {
    setPayLoading(true);
    setPayError(null);
    setPayResult(null);
    try {
      const data = await payLightningInvoice(payInvoice);
      if (data.state === 'paid') {
        setPayResult('Invoice paid successfully!');
      } else if (data.state === 'pending') {
        setPayResult('Invoice is pending.');
      } else if (data.state === 'unpaid') {
        setPayResult('Invoice is unpaid.');
      } else {
        setPayResult(data.state);
      }

      // After generating the invoice, before starting the poll interval:
      const balanceData = await getBalance();
      const initialBalance = balanceData.mints && balanceData.mints[selectedMint]
        ? balanceData.mints[selectedMint].available
        : 0;

      let pollCount = 0;
      const maxPolls = 60; // 5 minutes if polling every 5 seconds

      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          // Check invoice status as before
          const status = await checkInvoiceStatus(payInvoice, selectedMint);

          // Check current balance
          const balanceData = await getBalance();
          const newBalance = balanceData.mints && balanceData.mints[selectedMint]
            ? balanceData.mints[selectedMint].available
            : 0;

          // If invoice is settled or balance increased, stop polling and show success
          if ((status && status.result === 'SETTLED') || newBalance > initialBalance) {
            clearInterval(pollInterval);
            setModalVisible(false);
            Alert.alert('Success!', 'Payment received and tokens claimed', [
              { text: 'OK' }
            ]);
            return;
          }
        } catch (error) {
          clearInterval(pollInterval);
          setModalVisible(false);
          Alert.alert(
            'Error',
            'There was a problem checking the invoice status. Please check your balance manually.'
          );
          return;
        }
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setModalVisible(false);
          Alert.alert('Timeout', 'Invoice polling timed out. Please check your balance manually.');
        }
      }, 5000);
    } catch (err: any) {
      setPayError(err.message || 'Failed to send BTC');
    } finally {
      setPayLoading(false);
    }
  };

  const renderReceive = () => (
    <View style={styles.tabContent}>
      <>
        <TextInput
          style={styles.input}
          placeholder="BTC (sats) to Receive"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerateInvoice}
          disabled={loading || !amount}
        >
          <Text style={styles.buttonText}>Receive BTC</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      </>
    </View>
  );

  const renderPayInvoice = () => (
    <View style={styles.tabContent}>
      <TextInput
        style={[styles.input, styles.invoiceInput]}
        placeholder="Paste BTC Lightning Invoice"
        placeholderTextColor={theme.colors.placeholder}
        multiline
        value={payInvoice}
        onChangeText={setPayInvoice}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handlePayInvoice}
        disabled={payLoading || !payInvoice}
      >
        <Text style={styles.buttonText}>Send BTC</Text>
      </TouchableOpacity>
      {payLoading && <ActivityIndicator size="large" color="#007AFF" />}
      {payError && <Text style={styles.error}>{payError}</Text>}
      {payResult && <Text style={[styles.success, { textAlign: 'center' }]}>{payResult}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'send' && styles.activeTab]}
          onPress={() => setActiveTab('send')}
        >
          <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'receive' && styles.activeTab]}
          onPress={() => setActiveTab('receive')}
        >
          <Text style={[styles.tabText, activeTab === 'receive' && styles.activeTabText]}>
            Receive
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'receive' && renderReceive()}
        {activeTab === 'send' && renderPayInvoice()}
      </ScrollView>

      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lightning Invoice Generated!</Text>
            <View style={styles.invoiceBox}>
              <Text selectable style={styles.invoiceText}>{generatedInvoice}</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => Clipboard.setString(generatedInvoice || '')}>
                <Text style={styles.flatButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.flatButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContent: {
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  balance: {
    fontSize: theme.typography.fontSizes.xxlarge,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.s,
    width: '57.5%',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: '600',
  },
  success: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.success,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    textAlign: 'center',
  },
  tokenBox: {
    marginTop: theme.spacing.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.card,
  },
  tokenLabel: {
    fontSize: theme.typography.fontSizes.small,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  token: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
  },
  invoiceInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  invoice: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  titleWithMargin: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    minWidth: 300,
    ...theme.shadows.large,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
  },
  modalMessage: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  invoiceBox: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  invoiceText: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  flatButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
    marginHorizontal: theme.spacing.m,
  },
});

export default WalletScreen; 