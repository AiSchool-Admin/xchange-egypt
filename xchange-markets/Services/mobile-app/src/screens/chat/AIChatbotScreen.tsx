// ============================================
// AI Chatbot Screen - Egyptian Dialect Support
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Text, TextInput, IconButton, Avatar, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { chatApi } from '../../services/api/chat';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  serviceRecommendations?: any[];
}

const QUICK_PROMPTS = {
  ar: [
    'إزاي أقدر أحجز خدمة؟',
    'محتاج ميكانيكي قريب مني',
    'إيه أحسن سباك في المنطقة؟',
    'عايز أعرف أسعار تصليح الموبايل',
    'إزاي أبقى مقدم خدمة؟',
  ],
  en: [
    'How can I book a service?',
    'I need a mechanic near me',
    'What\'s the best plumber in my area?',
    'I want to know mobile repair prices',
    'How do I become a service provider?',
  ],
};

export default function AIChatbotScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isDarkMode, language } = useSettingsStore();
  const { user } = useAuthStore();
  const isRTL = language === 'ar';

  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isRTL
        ? 'أهلاً بيك في إكسشينج! 👋\nأنا مساعدك الذكي، هساعدك تلاقي أفضل الخدمات والحرفيين. إيه اللي تحتاجه النهارده؟'
        : 'Welcome to Xchange! 👋\nI\'m your smart assistant, here to help you find the best services and professionals. What do you need today?',
      timestamp: new Date(),
      suggestions: isRTL ? QUICK_PROMPTS.ar : QUICK_PROMPTS.en,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const typingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      chatApi.sendChatbotMessage({
        message,
        language: isRTL ? 'ar-EG' : 'en',
        context: {
          userId: user?.id,
          location: user?.location,
        },
      }),
    onSuccess: (data) => {
      const response = data.data;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          suggestions: response.suggestions,
          serviceRecommendations: response.recommendations,
        },
      ]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: isRTL
            ? 'عذراً، حصل مشكلة. ممكن تحاول تاني؟'
            : 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    },
  });

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    sendMessageMutation.mutate(messageText);
  };

  const handleServicePress = (serviceId: string) => {
    navigation.navigate('ServiceDetail', { serviceId });
  };

  const handleProviderPress = (providerId: string) => {
    navigation.navigate('ProviderProfile', { providerId });
  };

  const styles = createStyles(isDarkMode, isRTL);

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.assistantAvatar}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
          </LinearGradient>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
            ]}
          >
            {message.content}
          </Text>

          {/* Service Recommendations */}
          {message.serviceRecommendations && message.serviceRecommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              {message.serviceRecommendations.map((service: any) => (
                <Pressable
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service.id)}
                >
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>
                      {isRTL ? service.titleAr : service.title}
                    </Text>
                    <Text style={styles.serviceProvider}>
                      {isRTL ? service.provider?.businessNameAr : service.provider?.businessName}
                    </Text>
                    <View style={styles.serviceFooter}>
                      <Text style={styles.serviceRating}>
                        ⭐ {service.rating?.toFixed(1)}
                      </Text>
                      <Text style={styles.servicePrice}>
                        {service.basePrice?.toLocaleString()} {t('common.egp')}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={20}
                    color={theme.colors.primary}
                  />
                </Pressable>
              ))}
            </View>
          )}

          {/* Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {message.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.suggestionChip}
                  textStyle={styles.suggestionText}
                  onPress={() => handleSend(suggestion)}
                >
                  {suggestion}
                </Chip>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="close"
          onPress={() => navigation.goBack()}
          iconColor={isDarkMode ? theme.colors.textDark : theme.colors.text}
        />
        <View style={styles.headerTitle}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.headerAvatar}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerName}>{t('chatbot.name')}</Text>
            <Text style={styles.headerStatus}>{t('chatbot.status')}</Text>
          </View>
        </View>
        <IconButton
          icon="refresh"
          onPress={() => {
            setMessages([{
              id: '1',
              role: 'assistant',
              content: isRTL
                ? 'أهلاً بيك في إكسشينج! 👋\nأنا مساعدك الذكي، هساعدك تلاقي أفضل الخدمات والحرفيين. إيه اللي تحتاجه النهارده؟'
                : 'Welcome to Xchange! 👋\nI\'m your smart assistant, here to help you find the best services and professionals. What do you need today?',
              timestamp: new Date(),
              suggestions: isRTL ? QUICK_PROMPTS.ar : QUICK_PROMPTS.en,
            }]);
          }}
          iconColor={isDarkMode ? theme.colors.textDark : theme.colors.text}
        />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.assistantAvatar}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
            </LinearGradient>
            <View style={styles.typingBubble}>
              <Animated.View
                style={[
                  styles.typingDot,
                  {
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.typingDot,
                  {
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.4, 1, 0.4],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.typingDot,
                  {
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.4],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder={t('chatbot.placeholder')}
          value={input}
          onChangeText={setInput}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          right={
            <TextInput.Icon
              icon="send"
              color={input.trim() ? theme.colors.primary : theme.colors.textSecondary}
              onPress={() => handleSend()}
              disabled={!input.trim()}
            />
          }
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          multiline
          maxLength={500}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
    },
    headerTitle: {
      flex: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerName: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    headerStatus: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.success,
      textAlign: isRTL ? 'right' : 'left',
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    messageContainer: {
      marginBottom: theme.spacing.md,
    },
    userMessageContainer: {
      alignItems: isRTL ? 'flex-start' : 'flex-end',
    },
    assistantMessageContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    assistantAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageBubble: {
      maxWidth: width * 0.75,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    userBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: isRTL ? theme.borderRadius.lg : 4,
      borderBottomLeftRadius: isRTL ? 4 : theme.borderRadius.lg,
    },
    assistantBubble: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderBottomLeftRadius: isRTL ? theme.borderRadius.lg : 4,
      borderBottomRightRadius: isRTL ? 4 : theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    messageText: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      lineHeight: 22,
    },
    userMessageText: {
      color: '#fff',
      textAlign: isRTL ? 'right' : 'left',
    },
    assistantMessageText: {
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    timestamp: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    recommendationsContainer: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    serviceCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    serviceInfo: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    serviceName: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    serviceProvider: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
    },
    serviceFooter: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: theme.spacing.md,
      marginTop: 4,
    },
    serviceRating: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.star,
    },
    servicePrice: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    suggestionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    suggestionChip: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
    },
    suggestionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    typingContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    typingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: 6,
      ...theme.shadows.sm,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    inputContainer: {
      padding: theme.spacing.md,
      paddingBottom: 34,
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    input: {
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
      maxHeight: 100,
    },
    inputOutline: {
      borderRadius: theme.borderRadius.full,
    },
  });
