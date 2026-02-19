import { useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { showAlert, confirmDestructive } from "@/lib/confirm";

interface AudioRecorderProps {
  trabajoId: number;
}

/**
 * Componente para grabar audios y subirlos al backend.
 * Límite: 5 audios por trabajo, 30 segundos por audio.
 * Usa MediaRecorder en web.
 */
export function AudioRecorderWidget({ trabajoId }: AudioRecorderProps) {
  const colors = useColors();
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const utils = trpc.useUtils();
  const { data: audiosList, isLoading: loadingAudios } = trpc.superAdmin.audios.getByTrabajoId.useQuery({ trabajoId });
  const uploadMutation = trpc.superAdmin.audios.upload.useMutation({
    onSuccess: () => {
      utils.superAdmin.audios.getByTrabajoId.invalidate({ trabajoId });
      showAlert("Audio guardado", "El audio se guardó correctamente.");
    },
    onError: (err) => showAlert("Error", err.message),
  });
  const deleteMutation = trpc.superAdmin.audios.delete.useMutation({
    onSuccess: () => {
      utils.superAdmin.audios.getByTrabajoId.invalidate({ trabajoId });
    },
    onError: (err) => showAlert("Error", err.message),
  });

  const audioCount = audiosList?.length ?? 0;
  const maxAudios = 5;
  const canRecord = audioCount < maxAudios;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const iniciarGrabacion = async () => {
    if (Platform.OS !== "web") {
      showAlert("Info", "La grabación de audio solo está disponible en la versión web.");
      return;
    }
    if (!canRecord) {
      showAlert("Límite alcanzado", `Máximo ${maxAudios} audios por trabajo.`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await subirAudio(blob);
      };

      mediaRecorder.start(1000); // chunks cada 1s
      setGrabando(true);
      setSegundos(0);

      // Timer de conteo y auto-stop a 30s
      timerRef.current = setInterval(() => {
        setSegundos((prev) => {
          if (prev >= 29) {
            detenerGrabacion();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      showAlert("Error", "No se pudo acceder al micrófono. Verifica los permisos del navegador.");
    }
  };

  const detenerGrabacion = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setGrabando(false);
  };

  const subirAudio = async (blob: Blob) => {
    setSubiendo(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      // Convertir a base64
      let binary = "";
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const base64 = btoa(binary);

      await uploadMutation.mutateAsync({
        trabajoId,
        base64,
        duracion: segundos,
        mimeType: "audio/webm",
      });
    } catch (err: any) {
      showAlert("Error", err.message || "No se pudo subir el audio.");
    } finally {
      setSubiendo(false);
      setSegundos(0);
    }
  };

  const handleEliminarAudio = (audioId: number) => {
    confirmDestructive(
      "Eliminar audio",
      "¿Estás seguro de eliminar este audio?",
      () => deleteMutation.mutate({ id: audioId })
    );
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">Audios ({audioCount}/{maxAudios})</Text>
        {canRecord && !grabando && !subiendo && (
          <TouchableOpacity
            onPress={iniciarGrabacion}
            activeOpacity={0.7}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: colors.primary + "20",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <IconSymbol name="mic.fill" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Grabando */}
      {grabando && (
        <View className="bg-surface rounded-2xl p-4 border border-border items-center gap-2">
          <View className="flex-row items-center gap-2">
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error }} />
            <Text className="text-base font-semibold" style={{ color: colors.error }}>Grabando... {segundos}s / 30s</Text>
          </View>
          <TouchableOpacity
            onPress={detenerGrabacion}
            activeOpacity={0.7}
            style={{ backgroundColor: colors.error, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 }}
          >
            <Text className="text-sm font-semibold text-white">Detener</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subiendo */}
      {subiendo && (
        <View className="bg-surface rounded-2xl p-4 border border-border items-center gap-2">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="text-sm text-muted">Subiendo audio...</Text>
        </View>
      )}

      {/* Lista de audios */}
      {loadingAudios ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : audiosList && audiosList.length > 0 ? (
        <View className="gap-2">
          {audiosList.map((audio: any, idx: number) => (
            <View key={audio.id} className="bg-surface rounded-xl p-3 border border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <IconSymbol name="mic.fill" size={16} color={colors.primary} />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">Audio #{idx + 1}</Text>
                  <Text className="text-xs text-muted">{audio.duracion}s • {new Date(audio.createdAt).toLocaleDateString("es-CR")}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                {audio.url && (
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === "web") {
                        const a = new Audio(audio.url);
                        a.play();
                      }
                    }}
                    activeOpacity={0.7}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}
                  >
                    <IconSymbol name="play.fill" size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleEliminarAudio(audio.id)}
                  activeOpacity={0.7}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.error + "20", alignItems: "center", justifyContent: "center" }}
                >
                  <IconSymbol name="trash.fill" size={14} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-muted">Sin audios grabados.</Text>
      )}
    </View>
  );
}
