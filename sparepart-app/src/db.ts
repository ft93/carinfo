import Dexie, { type Table } from 'dexie';

/** Master sparepart */
export interface Part {
  id?: number;
  sku: string;
  name: string;
  unit: string; // pcs, liter, set, ...
  minStock: number;
  createdAt: number;
}

/** Mobil customer / unit */
export interface Vehicle {
  id?: number;
  plate: string; // nomor polisi
  brand: string;
  model: string;
  year?: number;
  owner?: string;
  createdAt: number;
}

/** Transaksi BELI (stok masuk) */
export interface Purchase {
  id?: number;
  date: string; // YYYY-MM-DD
  partId: number;
  qty: number;
  unitCost: number; // harga beli per unit (Rp)
  supplier?: string;
  note?: string;
  createdAt: number;
}

/** Transaksi PAKAI (stok keluar) - dipakai untuk pekerjaan apa, di mobil mana */
export interface Usage {
  id?: number;
  date: string;
  partId: number;
  qty: number;
  vehicleId: number;
  job: string; // dipakai dimana: jenis pekerjaan / servis
  mechanic?: string;
  note?: string;
  createdAt: number;
}

class SparepartDB extends Dexie {
  parts!: Table<Part, number>;
  vehicles!: Table<Vehicle, number>;
  purchases!: Table<Purchase, number>;
  usages!: Table<Usage, number>;

  constructor() {
    super('sparepart-bengkel');
    this.version(1).stores({
      parts: '++id, &sku, name',
      vehicles: '++id, &plate',
      purchases: '++id, date, partId',
      usages: '++id, date, partId, vehicleId',
    });
  }
}

export const db = new SparepartDB();

export async function exportBackup() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    parts: await db.parts.toArray(),
    vehicles: await db.vehicles.toArray(),
    purchases: await db.purchases.toArray(),
    usages: await db.usages.toArray(),
  };
}

export async function importBackup(data: Awaited<ReturnType<typeof exportBackup>>) {
  await db.transaction('rw', [db.parts, db.vehicles, db.purchases, db.usages], async () => {
    await Promise.all([db.parts.clear(), db.vehicles.clear(), db.purchases.clear(), db.usages.clear()]);
    await db.parts.bulkAdd(data.parts);
    await db.vehicles.bulkAdd(data.vehicles);
    await db.purchases.bulkAdd(data.purchases);
    await db.usages.bulkAdd(data.usages);
  });
}
