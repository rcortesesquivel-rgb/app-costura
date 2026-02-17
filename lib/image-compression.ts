/**
 * Comprime una imagen a un tamaño máximo de 1MB
 * Utiliza Canvas API para redimensionar y comprimir la imagen
 */
export async function compressImage(
  imageUri: string,
  maxSizeInMB: number = 1
): Promise<{ uri: string; base64: string; size: number }> {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  try {
    // Obtener la imagen como blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Si ya está por debajo del límite, devolver como está
    if (blob.size <= maxSizeInBytes) {
      const base64 = await blobToBase64(blob);
      return {
        uri: imageUri,
        base64,
        size: blob.size,
      };
    }

    // Comprimir la imagen
    const canvas = await createCanvasFromBlob(blob);
    let quality = 0.9;
    let compressedBase64 = "";
    let compressedSize = maxSizeInBytes + 1;

    // Reducir calidad hasta alcanzar el tamaño máximo
    while (compressedSize > maxSizeInBytes && quality > 0.1) {
      compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      compressedSize = Math.ceil((compressedBase64.length * 3) / 4);
      quality -= 0.1;
    }

    return {
      uri: compressedBase64,
      base64: compressedBase64.split(",")[1] || "",
      size: compressedSize,
    };
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
}

/**
 * Convierte un Blob a Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Crea un canvas a partir de un Blob de imagen
 */
function createCanvasFromBlob(blob: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Calcular nuevas dimensiones manteniendo aspecto
        let width = img.width;
        let height = img.height;
        const maxDimension = 2048;

        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Comprime una imagen desde un archivo local (React Native)
 * Utiliza manipulación de imágenes nativa
 */
export async function compressImageNative(
  imageUri: string,
  maxSizeInMB: number = 1
): Promise<{ uri: string; size: number }> {
  try {
    // En React Native, usaríamos expo-image-manipulator
    // Por ahora, retornamos la imagen original
    // TODO: Implementar con expo-image-manipulator
    return {
      uri: imageUri,
      size: 0,
    };
  } catch (error) {
    console.error("Error compressing image (native):", error);
    throw error;
  }
}
