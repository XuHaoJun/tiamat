import date2Time from './date2Time';

export default function defaultSameIdElesMax(sameIdEles) {
  return sameIdEles.max((a, b) => {
    const aUpdatedAt = date2Time(a.get('updatedAt'));
    const bUpdatedAt = date2Time(b.get('updatedAt'));
    if (aUpdatedAt > bUpdatedAt) {
      return 1;
    } else if (aUpdatedAt < bUpdatedAt) {
      return -1;
    } else if (aUpdatedAt === bUpdatedAt) {
      const aCount = a.count();
      const bCount = b.count();
      if (aCount > bCount) {
        return 1;
      } else if (aCount < bCount) {
        return -1;
      } else if (aCount === bCount) {
        const aCountNull = a.countBy(v => v === null);
        const bCountNull = b.countBy(v => v === null);
        if (aCountNull > bCountNull) {
          return 1;
        } else if (aCountNull < bCountNull) {
          return -1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  });
}
