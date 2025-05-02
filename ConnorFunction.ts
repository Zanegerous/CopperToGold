export const purgePreviousSales = onSchedule("every day 00:00", async () => {
  const salesRef = db.ref("sales");
  const snapshot = await salesRef.get();

  if (!snapshot.exists()) return;

  const today = new Date();

  const updates: Record<string, any> = {};

  snapshot.forEach((child:any) => {
      const item = child.val();
      const key = child.key;

      if (item?.dates?.endDates) {
          let latestEndDate: Date;
  
          if (Array.isArray(item.dates.endDates)) {
              const sorted = item.dates.endDates
                  .map((dateStr: string) => new Date(dateStr))
                  .sort((a: Date, b: Date) => b.getTime() - a.getTime());
  
              latestEndDate = sorted[0];
          } else {
              latestEndDate = new Date(item.dates.endDates);
          }
  
          if (latestEndDate < today) {
              updates[`/sales/${key}`] = null;
          }
      }
  
       return false; // to satisfy forEach's type
  });
  
  if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(`Deleted ${Object.keys(updates).length} expired items.`);
  } else {
      console.log('No expired items to delete.');
  }
});