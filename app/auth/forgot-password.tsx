import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCheckoutButton, setShowCheckoutButton] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    setError('');
    setMessage('');
    setShowCheckoutButton(false);

    try {
      const result = await forgotPasswordMutation.mutateAsync({ email: email.toLowerCase() });

      if (result.success) {
        setMessage('Se envió un enlace de recuperación a tu email. Revisa tu bandeja de entrada.');
        setEmail('');

        // En desarrollo, redirigir directamente con el token
        if (result.token) {
          setTimeout(() => {
            router.push(`/auth/reset-password?token=${result.token}`);
          }, 2000);
        } else {
          setTimeout(() => {
            router.push('/auth/signin');
          }, 2000);
        }
      } else {
        // Manejar según el estado del usuario
        if (result.userStatus === 'not_found') {
          setError('Email no registrado. ¡Conoce nuestra plataforma!');
          setShowCheckoutButton(true);
          setCheckoutUrl(result.redirectUrl || 'https://costuraapp-matbtw2g.manus.space/');
        } else if (result.userStatus === 'trial_expired') {
          setError(result.message || 'Tu período de prueba ha vencido.');
          setShowCheckoutButton(true);
          setCheckoutUrl(result.redirectUrl || 'https://pay.hotmart.com/T104497671V');
        } else {
          setError(result.message || 'Error al procesar la solicitud');
        }
      }
    } catch (err) {
      setError('Error al procesar la solicitud. Intenta de nuevo.');
      console.error('Forgot password error:', err);
    }
  };

  const handleOpenCheckout = () => {
    if (checkoutUrl) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(checkoutUrl, '_blank');
      } else {
        Linking.openURL(checkoutUrl);
      }
    }
  };

  const isLoading = forgotPasswordMutation.isPending;
  const isLandingUrl = checkoutUrl.includes('costuraapp-matbtw2g');

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">
              Recuperar Contraseña
            </Text>
            <Text className="text-base text-muted">
              Ingresa tu email para recibir un enlace de recuperación
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Email
            </Text>
            <TextInput
              placeholder="tu@email.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.foreground,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8 }}>
              <Text style={{ color: '#B91C1C', fontSize: 14, fontWeight: '600' }}>{error}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {message ? (
            <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 8 }}>
              <Text style={{ color: '#15803D', fontSize: 14, fontWeight: '600' }}>{message}</Text>
            </View>
          ) : null}

          {/* Send Button */}
          <Pressable
            onPress={handleForgotPassword}
            disabled={isLoading}
            style={({ pressed }) => ({
              width: '100%',
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 16,
              opacity: isLoading ? 0.7 : pressed ? 0.85 : 1,
            })}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={{ color: colors.background, fontWeight: '600', fontSize: 16 }}>
                Enviar Enlace de Recuperación
              </Text>
            )}
          </Pressable>

          {/* Checkout/Landing Button */}
          {showCheckoutButton ? (
            <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 8 }}>
              <Pressable
                onPress={handleOpenCheckout}
                style={({ pressed }) => ({
                  width: '100%',
                  backgroundColor: isLandingUrl ? '#F97316' : '#22C55E',
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                  {isLandingUrl ? 'Conocer la Plataforma' : 'Adquirir Membresía'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Back to Login */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: '100%',
              alignItems: 'center',
              paddingVertical: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              Volver al Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
