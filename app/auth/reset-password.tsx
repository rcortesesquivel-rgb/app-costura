import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Linking, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCheckoutButton, setShowCheckoutButton] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();
  const validateTokenMutation = trpc.auth.validateResetToken.useMutation();

  // Validar token al cargar la pantalla
  useEffect(() => {
    if (!token) {
      setError('Token no válido');
      setLoading(false);
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const result = await validateTokenMutation.mutateAsync({ token: token! });

      if (result.valid && result.email) {
        setTokenValid(true);
        setEmail(result.email);
        setError('');
      } else {
        setError(result.message || 'Token inválido o expirado');
        setTokenValid(false);

        if (result.userStatus === 'trial_expired') {
          setShowCheckoutButton(true);
          setCheckoutUrl('https://pay.hotmart.com/T104497671V');
        }
      }
    } catch (err) {
      setError('Error al validar el token');
      console.error('Token validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token) {
      setError('Token no válido');
      return;
    }

    setError('');

    try {
      const result = await resetPasswordMutation.mutateAsync({ token });

      if (result.success) {
        setMessage('Contraseña actualizada correctamente. Redirigiendo al login...');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        setError(result.message || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
      console.error('Reset password error:', err);
    }
  };

  const handleOpenUrl = (url: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.foreground, marginTop: 16 }}>Validando enlace...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!tokenValid) {
    return (
      <ScreenContainer className="bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '100%', maxWidth: 400 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 16, textAlign: 'center' }}>
                Enlace Expirado
              </Text>
              <View style={{ padding: 16, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, marginBottom: 24 }}>
                <Text style={{ color: '#B91C1C', fontSize: 14 }}>
                  {error || 'El enlace de recuperación ha expirado o no es válido'}
                </Text>
              </View>

              {showCheckoutButton ? (
                <Pressable
                  onPress={() => handleOpenUrl(checkoutUrl)}
                  style={({ pressed }) => ({
                    width: '100%',
                    backgroundColor: '#F97316',
                    borderRadius: 8,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginBottom: 16,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                    Adquirir Membresía
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={() => router.push('/auth/forgot-password')}
                style={({ pressed }) => ({
                  width: '100%',
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginBottom: 16,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: colors.background, fontWeight: '600', fontSize: 16 }}>
                  Solicitar Nuevo Enlace
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/auth/signin')}
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
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  const isResetting = resetPasswordMutation.isPending;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
              Actualizar Contraseña
            </Text>
            <Text style={{ fontSize: 16, color: colors.muted }}>
              Confirma el cambio de contraseña para tu cuenta
            </Text>
          </View>

          {/* Email Display */}
          <View style={{ marginBottom: 24, padding: 16, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 4 }}>Email</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              {email}
            </Text>
          </View>

          {/* Success Message */}
          {message ? (
            <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 8 }}>
              <Text style={{ color: '#15803D', fontSize: 14, fontWeight: '600' }}>{message}</Text>
            </View>
          ) : null}

          {/* Error Message */}
          {error ? (
            <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8 }}>
              <Text style={{ color: '#B91C1C', fontSize: 14, fontWeight: '600' }}>{error}</Text>
            </View>
          ) : null}

          {/* Confirm Button */}
          <Pressable
            onPress={handleResetPassword}
            disabled={isResetting}
            style={({ pressed }) => ({
              width: '100%',
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 16,
              opacity: isResetting ? 0.7 : pressed ? 0.85 : 1,
            })}
          >
            {isResetting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={{ color: colors.background, fontWeight: '600', fontSize: 16 }}>
                Confirmar Cambio de Contraseña
              </Text>
            )}
          </Pressable>

          {/* Back to Login */}
          <Pressable
            onPress={() => router.push('/auth/signin')}
            style={({ pressed }) => ({
              width: '100%',
              alignItems: 'center',
              paddingVertical: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              Ir al Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
