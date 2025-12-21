// ============================================
// Root Navigator - Main Navigation Structure
// ============================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../constants/theme';
import { RootStackParamList, MainTabParamList, ProviderTabParamList } from '../types';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import SearchResultsScreen from '../screens/search/SearchResultsScreen';
import ServiceDetailScreen from '../screens/services/ServiceDetailScreen';
import ProviderProfileScreen from '../screens/services/ProviderProfileScreen';
import AllReviewsScreen from '../screens/services/AllReviewsScreen';

// Booking Screens
import BookingFlowScreen from '../screens/bookings/BookingFlowScreen';
import BookingConfirmationScreen from '../screens/bookings/BookingConfirmationScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';
import BookingsListScreen from '../screens/bookings/BookingsListScreen';
import BookingChatScreen from '../screens/bookings/BookingChatScreen';

// Review & Dispute Screens
import WriteReviewScreen from '../screens/bookings/WriteReviewScreen';
import CreateDisputeScreen from '../screens/bookings/CreateDisputeScreen';
import DisputeDetailScreen from '../screens/bookings/DisputeDetailScreen';

// Wallet Screens
import WalletScreen from '../screens/profile/WalletScreen';
import TransactionHistoryScreen from '../screens/profile/TransactionHistoryScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Provider Screens
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import ProviderServicesScreen from '../screens/provider/ProviderServicesScreen';
import AddServiceScreen from '../screens/provider/AddServiceScreen';
import EditServiceScreen from '../screens/provider/EditServiceScreen';
import ProviderBookingsScreen from '../screens/provider/ProviderBookingsScreen';
import ProviderCalendarScreen from '../screens/provider/ProviderCalendarScreen';
import ProviderEarningsScreen from '../screens/provider/ProviderEarningsScreen';
import ProviderPayoutsScreen from '../screens/provider/ProviderPayoutsScreen';
import ProviderReviewsScreen from '../screens/provider/ProviderReviewsScreen';
import ProviderRegistrationScreen from '../screens/provider/ProviderRegistrationScreen';
import ProviderSettingsScreen from '../screens/provider/ProviderSettingsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import PendingProvidersScreen from '../screens/admin/PendingProvidersScreen';
import ProviderApprovalScreen from '../screens/admin/ProviderApprovalScreen';
import AllDisputesScreen from '../screens/admin/AllDisputesScreen';
import DisputeResolutionScreen from '../screens/admin/DisputeResolutionScreen';

// Chat Screens
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';

// AI Chatbot
import AIChatbotScreen from '../screens/chat/AIChatbotScreen';

// Academy
import AcademyScreen from '../screens/provider/AcademyScreen';
import CourseDetailScreen from '../screens/provider/CourseDetailScreen';
import CourseModuleScreen from '../screens/provider/CourseModuleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ProviderTab = createBottomTabNavigator<ProviderTabParamList>();

// Customer Bottom Tab Navigator
function CustomerTabNavigator() {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'SearchTab':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'BookingsTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'WalletTab':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDarkMode ? theme.colors.textSecondaryDark : theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontFamily: 'Cairo-Medium',
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: t('tabs.home') }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: t('tabs.search') }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsListScreen}
        options={{ title: t('tabs.bookings') }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{ title: t('tabs.wallet') }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}

// Provider Bottom Tab Navigator
function ProviderTabNavigator() {
  const { t } = useTranslation();
  const { isDarkMode } = useSettingsStore();

  return (
    <ProviderTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Services':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDarkMode ? theme.colors.textSecondaryDark : theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontFamily: 'Cairo-Medium',
          fontSize: 12,
        },
      })}
    >
      <ProviderTab.Screen
        name="Dashboard"
        component={ProviderDashboardScreen}
        options={{ title: t('provider.tabs.dashboard') }}
      />
      <ProviderTab.Screen
        name="Services"
        component={ProviderServicesScreen}
        options={{ title: t('provider.tabs.services') }}
      />
      <ProviderTab.Screen
        name="Bookings"
        component={ProviderBookingsScreen}
        options={{ title: t('provider.tabs.bookings') }}
      />
      <ProviderTab.Screen
        name="Calendar"
        component={ProviderCalendarScreen}
        options={{ title: t('provider.tabs.calendar') }}
      />
      <ProviderTab.Screen
        name="Account"
        component={ProviderSettingsScreen}
        options={{ title: t('provider.tabs.account') }}
      />
    </ProviderTab.Navigator>
  );
}

// Main Root Navigator
export function RootNavigator() {
  const { isAuthenticated, isProvider, user } = useAuthStore();
  const { isDarkMode } = useSettingsStore();
  const { t } = useTranslation();

  const isAdmin = user?.email?.endsWith('@xchange.eg') || false;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        </>
      ) : (
        // Authenticated Stack
        <>
          {/* Main Tabs */}
          <Stack.Screen
            name="MainTabs"
            component={isProvider ? ProviderTabNavigator : CustomerTabNavigator}
          />

          {/* Search */}
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />

          {/* Services */}
          <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
          <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
          <Stack.Screen name="AllReviews" component={AllReviewsScreen} />

          {/* Booking Flow */}
          <Stack.Screen
            name="BookingFlow"
            component={BookingFlowScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
          <Stack.Screen name="BookingChat" component={BookingChatScreen} />

          {/* Reviews & Disputes */}
          <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
          <Stack.Screen name="CreateDispute" component={CreateDisputeScreen} />
          <Stack.Screen name="DisputeDetail" component={DisputeDetailScreen} />

          {/* Wallet */}
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />

          {/* Profile */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Addresses" component={AddressesScreen} />
          <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />

          {/* Provider Screens */}
          <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
          <Stack.Screen name="ProviderServices" component={ProviderServicesScreen} />
          <Stack.Screen name="AddService" component={AddServiceScreen} />
          <Stack.Screen name="EditService" component={EditServiceScreen} />
          <Stack.Screen name="ProviderBookings" component={ProviderBookingsScreen} />
          <Stack.Screen name="ProviderCalendar" component={ProviderCalendarScreen} />
          <Stack.Screen name="ProviderEarnings" component={ProviderEarningsScreen} />
          <Stack.Screen name="ProviderPayouts" component={ProviderPayoutsScreen} />
          <Stack.Screen name="ProviderReviews" component={ProviderReviewsScreen} />
          <Stack.Screen name="ProviderSettings" component={ProviderSettingsScreen} />
          <Stack.Screen name="ProviderRegistration" component={ProviderRegistrationScreen} />

          {/* Academy */}
          <Stack.Screen name="Academy" component={AcademyScreen} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="CourseModule" component={CourseModuleScreen} />

          {/* Chat */}
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />

          {/* AI Chatbot */}
          <Stack.Screen
            name="AIChatbot"
            component={AIChatbotScreen}
            options={{ presentation: 'modal' }}
          />

          {/* Admin Screens */}
          {isAdmin && (
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen name="PendingProviders" component={PendingProvidersScreen} />
              <Stack.Screen name="ProviderApproval" component={ProviderApprovalScreen} />
              <Stack.Screen name="AllDisputes" component={AllDisputesScreen} />
              <Stack.Screen name="DisputeResolution" component={DisputeResolutionScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}
