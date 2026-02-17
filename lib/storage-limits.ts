/**
 * Utilidades para validar límites de almacenamiento
 */

// Límites de almacenamiento por plan (en MB)
export const STORAGE_LIMITS = {
  monthly: 1024, // 1GB
  lifetime: 1024, // 1GB
} as const;

export function getStorageQuotaMB(plan: "monthly" | "lifetime"): number {
  return STORAGE_LIMITS[plan];
}

export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function canUploadFile(
  currentUsageMB: number,
  quotaMB: number,
  fileSizeMB: number
): boolean {
  return currentUsageMB + fileSizeMB <= quotaMB;
}

export function getRemainingStorageMB(
  currentUsageMB: number,
  quotaMB: number
): number {
  return Math.max(0, quotaMB - currentUsageMB);
}

export function getStoragePercentage(
  currentUsageMB: number,
  quotaMB: number
): number {
  return Math.min(100, Math.round((currentUsageMB / quotaMB) * 100));
}

export function getStorageWarningMessage(
  currentUsageMB: number,
  quotaMB: number
): string | null {
  const percentage = getStoragePercentage(currentUsageMB, quotaMB);
  const remainingMB = getRemainingStorageMB(currentUsageMB, quotaMB);

  if (percentage >= 90) {
    return `Casi sin espacio: ${remainingMB.toFixed(1)} MB disponibles`;
  }

  if (percentage >= 75) {
    return `Almacenamiento al ${percentage}%: ${remainingMB.toFixed(1)} MB disponibles`;
  }

  return null;
}
