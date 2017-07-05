import date2Time from "./date2Time";

export default function defaultSameIdElesMax(sameIdEles) {
  return sameIdEles.max((a, b) => {
    const aUpdatedAt = date2Time(a.get("updatedAt"));
    const bUpdatedAt = date2Time(b.get("updatedAt"));
    if (aUpdatedAt > bUpdatedAt) {
      return 1;
    }
    if (aUpdatedAt < bUpdatedAt) {
      return -1;
    }
    if (aUpdatedAt === bUpdatedAt) {
      const aCount = a.count();
      const bCount = b.count();
      if (aCount > bCount) {
        return 1;
      }
      if (aCount < bCount) {
        return -1;
      }
      return 0;
    }
    return 0;
  });
}
