import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { computeLedger } from './stock';

/** Semua data + ledger stok, reaktif terhadap perubahan IndexedDB */
export function useData() {
  return useLiveQuery(async () => {
    const [parts, vehicles, purchases, usages] = await Promise.all([
      db.parts.orderBy('name').toArray(),
      db.vehicles.orderBy('plate').toArray(),
      db.purchases.toArray(),
      db.usages.toArray(),
    ]);
    return { parts, vehicles, purchases, usages, ledger: computeLedger(purchases, usages) };
  });
}
