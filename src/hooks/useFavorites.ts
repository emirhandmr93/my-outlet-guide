import { useMemo, useState } from "react";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  function toggleFavorite(outletId: string) {
    setFavoriteIds((current) => {
      if (current.includes(outletId)) {
        return current.filter((id) => id !== outletId);
      }

      return [...current, outletId];
    });
  }

  function isFavorite(outletId: string) {
    return favoriteIds.includes(outletId);
  }

  return useMemo(
    () => ({
      favoriteIds,
      toggleFavorite,
      isFavorite,
    }),
    [favoriteIds]
  );
}
