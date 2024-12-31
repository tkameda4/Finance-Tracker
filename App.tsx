import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Transaction interface
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

// Stack navigator
const Stack = createStackNavigator();

// FinanceTrackerScreen: Where the transactions for a selected tab are shown
const FinanceTrackerScreen: React.FC<{ route: any }> = ({ route }) => {
  const { tabName } = route.params;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  // Handle adding transaction (income or expense)
  const handleAddTransaction = (type: 'income' | 'expense') => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Please enter a valid amount.');
      return;
    }

    const newTransaction: Transaction = {
      id: Math.random().toString(),
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().slice(0, 10), // Format: YYYY-MM-DD
    };

    setTransactions([...transactions, newTransaction]);
    setAmount('');
  };

  // Calculate net income
  const calculateNetIncome = () => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return income - expense;
  };

  // Handle reset of the transactions for the month
  const handleReset = () => {
    Alert.alert('Are you sure you want to reset?', '', [
      {
        text: 'Cancel',
        onPress: () => console.log('Reset canceled'),
        style: 'cancel',
      },
      {
        text: 'Reset',
        onPress: () => {
          setTransactions([]);
          setAmount('');
          setType('income');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tabName} Finance Tracker</Text>
      <Text style={styles.netIncome}>Net Income: ${calculateNetIncome().toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.buttonGroup}>
        <Button title="Add Income" onPress={() => handleAddTransaction('income')} />
        <Button title="Add Expense" onPress={() => handleAddTransaction('expense')} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.transaction}>
            {item.date} - {item.type.toUpperCase()}: ${item.amount.toFixed(2)}
          </Text>
        )}
      />

      <View style={styles.resetButton}>
        <Button title="Reset" onPress={handleReset} />
      </View>
    </View>
  );
};

// TabListScreen: List of custom tabs (created by the user)
const TabListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tabs, setTabs] = useState<string[]>([]); // Store created tabs
  const [newTabName, setNewTabName] = useState<string>('');

  // Handle adding a new tab
  const handleAddTab = () => {
    if (newTabName.trim() === '') {
      Alert.alert('Please enter a valid tab name.');
      return;
    }
    setTabs([...tabs, newTabName]);
    setNewTabName('');
  };

  // Handle deleting a tab
  const handleDeleteTab = (tabName: string) => {
    Alert.alert(
      'Delete Tab',
      `Are you sure you want to delete the "${tabName}" tab?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deletion canceled'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            const filteredTabs = tabs.filter((tab) => tab !== tabName);
            setTabs(filteredTabs);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.newTabButton} onPress={handleAddTab}>
        <Text style={styles.newTabText}>+ New Tab</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter tab name"
        value={newTabName}
        onChangeText={setNewTabName}
      />

      <FlatList
        data={tabs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('FinanceTracker', { tabName: item })}
            >
              <Text style={styles.tab}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTab(item)}>
              <Text style={styles.deleteTab}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

// Main App component with Stack Navigator
const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TabList">
        {/* Use 'component' to pass the screen component correctly */}
        <Stack.Screen name="TabList" component={TabListScreen} />
        <Stack.Screen name="FinanceTracker" component={FinanceTrackerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles for the app
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  month: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 10,
    textAlign: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resetButton: {
    marginBottom: 20,
    borderWidth: 0.3,
    borderColor: 'black',
    borderRadius: 5,
  },
  netIncome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  transaction: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 10,
    textAlign: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  newTabButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  newTabText: {
    color: '#007BFF',
    fontSize: 18,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteTab: {
    color: 'red',
    fontSize: 16,
    padding: 10,
  },
});

export default App;