// ============================================
// Address Selector Component
// ============================================

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, TextInput, Button, RadioButton, IconButton, Portal, Modal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { theme } from '../../constants/theme';
import { GOVERNORATES } from '../../constants/config';
import { useSettingsStore } from '../../store/settingsStore';

interface Address {
  id: string;
  label: string;
  labelAr: string;
  street: string;
  streetAr?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  governorate: string;
  city: string;
  postalCode?: string;
  landmark?: string;
  landmarkAr?: string;
  isDefault: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

interface AddressSelectorProps {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: (address: Omit<Address, 'id'>) => void;
  isRTL: boolean;
}

export default function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  isRTL,
}: AddressSelectorProps) {
  const { t } = useTranslation();
  const { isDarkMode, language } = useSettingsStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    labelAr: '',
    street: '',
    streetAr: '',
    building: '',
    floor: '',
    apartment: '',
    governorate: '',
    city: '',
    postalCode: '',
    landmark: '',
    landmarkAr: '',
    isDefault: false,
    location: undefined as { lat: number; lng: number } | undefined,
  });

  const handleGetLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setNewAddress((prev) => ({
        ...prev,
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      }));

      // Reverse geocode to get address
      const [geocoded] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocoded) {
        setNewAddress((prev) => ({
          ...prev,
          street: geocoded.street || '',
          city: geocoded.city || '',
          governorate: geocoded.region || '',
          postalCode: geocoded.postalCode || '',
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmitAddress = () => {
    if (!newAddress.street || !newAddress.governorate || !newAddress.city) {
      return;
    }
    onAddNew(newAddress);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAddress({
      label: '',
      labelAr: '',
      street: '',
      streetAr: '',
      building: '',
      floor: '',
      apartment: '',
      governorate: '',
      city: '',
      postalCode: '',
      landmark: '',
      landmarkAr: '',
      isDefault: false,
      location: undefined,
    });
  };

  const styles = createStyles(isDarkMode, isRTL);

  return (
    <View style={styles.container}>
      {/* Saved Addresses */}
      {addresses.map((address) => (
        <Pressable
          key={address.id}
          style={[
            styles.addressCard,
            selectedId === address.id && styles.addressCardSelected,
          ]}
          onPress={() => onSelect(address.id)}
        >
          <RadioButton.Android
            value={address.id}
            status={selectedId === address.id ? 'checked' : 'unchecked'}
            onPress={() => onSelect(address.id)}
            color={theme.colors.primary}
          />
          <View style={styles.addressInfo}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressLabel}>
                {isRTL ? address.labelAr || address.label : address.label}
              </Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>{t('address.default')}</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText} numberOfLines={2}>
              {isRTL ? address.streetAr || address.street : address.street}
              {address.building && `, ${t('address.building')} ${address.building}`}
              {address.floor && `, ${t('address.floor')} ${address.floor}`}
            </Text>
            <Text style={styles.addressCity}>
              {address.city}, {address.governorate}
            </Text>
          </View>
        </Pressable>
      ))}

      {/* Add New Address Button */}
      <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.addButtonText}>{t('address.addNew')}</Text>
      </Pressable>

      {/* Add Address Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('address.addNew')}</Text>
              <IconButton
                icon="close"
                onPress={() => setShowAddModal(false)}
              />
            </View>

            {/* Get Location Button */}
            <Button
              mode="outlined"
              icon="location"
              onPress={handleGetLocation}
              loading={isLoadingLocation}
              style={styles.locationButton}
            >
              {t('address.useCurrentLocation')}
            </Button>

            {/* Address Form */}
            <TextInput
              label={t('address.label')}
              placeholder={isRTL ? 'مثال: المنزل، العمل' : 'e.g., Home, Work'}
              value={isRTL ? newAddress.labelAr : newAddress.label}
              onChangeText={(text) =>
                setNewAddress((prev) => ({
                  ...prev,
                  [isRTL ? 'labelAr' : 'label']: text,
                }))
              }
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label={t('address.street')}
              value={isRTL ? newAddress.streetAr : newAddress.street}
              onChangeText={(text) =>
                setNewAddress((prev) => ({
                  ...prev,
                  [isRTL ? 'streetAr' : 'street']: text,
                }))
              }
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label={t('address.building')}
                value={newAddress.building}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, building: text }))
                }
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label={t('address.floor')}
                value={newAddress.floor}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, floor: text }))
                }
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              label={t('address.apartment')}
              value={newAddress.apartment}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, apartment: text }))
              }
              mode="outlined"
              style={styles.input}
            />

            {/* Governorate Dropdown - simplified as TextInput for now */}
            <TextInput
              label={t('address.governorate')}
              value={newAddress.governorate}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, governorate: text }))
              }
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label={t('address.city')}
              value={newAddress.city}
              onChangeText={(text) =>
                setNewAddress((prev) => ({ ...prev, city: text }))
              }
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label={t('address.landmark')}
              placeholder={isRTL ? 'علامة مميزة قريبة' : 'Nearby landmark'}
              value={isRTL ? newAddress.landmarkAr : newAddress.landmark}
              onChangeText={(text) =>
                setNewAddress((prev) => ({
                  ...prev,
                  [isRTL ? 'landmarkAr' : 'landmark']: text,
                }))
              }
              mode="outlined"
              style={styles.input}
            />

            {/* Location Indicator */}
            {newAddress.location && (
              <View style={styles.locationIndicator}>
                <Ionicons name="location" size={16} color={theme.colors.success} />
                <Text style={styles.locationText}>{t('address.locationCaptured')}</Text>
              </View>
            )}

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmitAddress}
              style={styles.submitButton}
              disabled={!newAddress.street || !newAddress.governorate || !newAddress.city}
            >
              {t('address.save')}
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const createStyles = (isDarkMode: boolean, isRTL: boolean) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    addressCard: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    addressCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '10',
    },
    addressInfo: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    addressHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: 4,
    },
    addressLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    defaultBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    defaultBadgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    addressText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
    },
    addressCity: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
      marginTop: 4,
    },
    addButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: theme.borderRadius.lg,
    },
    addButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    modalContainer: {
      backgroundColor: isDarkMode ? theme.colors.surfaceDark : theme.colors.surface,
      margin: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: isDarkMode ? theme.colors.textDark : theme.colors.text,
    },
    locationButton: {
      marginBottom: theme.spacing.lg,
    },
    input: {
      marginBottom: theme.spacing.md,
      backgroundColor: isDarkMode ? theme.colors.backgroundDark : theme.colors.background,
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: theme.spacing.md,
    },
    halfInput: {
      flex: 1,
    },
    locationIndicator: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    locationText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.success,
    },
    submitButton: {
      marginTop: theme.spacing.md,
    },
  });
