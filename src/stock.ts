import type { Purchase, Usage } from './db';

/**
 * Valuasi stok metode Rata-rata Tertimbang Bergerak (Moving Average).
 * - Setiap pembelian: avgCost = (nilaiLama + qtyBeli*hargaBeli) / (qtyLama + qtyBeli)
 * - Setiap pemakaian: HPP = qtyPakai * avgCost saat itu; nilai stok berkurang sebesar HPP.
 * Transaksi diurutkan per tanggal, lalu urutan input (createdAt).
 * Pada tanggal yang sama, pembelian diproses lebih dulu dari pemakaian.
 */
export interface PartStock {
  partId: number;
  qty: number;
  avgCost: number;
  value: number;
  totalIn: number;
  totalOut: number;
}

export interface Ledger {
  byPart: Map<number, PartStock>;
  /** HPP per transaksi pemakaian (usage.id -> biaya) */
  usageCost: Map<number, number>;
  totalValue: number;
}

type Txn =
  | { kind: 'in'; t: Purchase }
  | { kind: 'out'; t: Usage };

export function computeLedger(purchases: Purchase[], usages: Usage[]): Ledger {
  const txns: Txn[] = [
    ...purchases.map((t) => ({ kind: 'in' as const, t })),
    ...usages.map((t) => ({ kind: 'out' as const, t })),
  ];
  txns.sort(
    (a, b) =>
      a.t.date.localeCompare(b.t.date) ||
      (a.kind === b.kind ? 0 : a.kind === 'in' ? -1 : 1) ||
      a.t.createdAt - b.t.createdAt,
  );

  const byPart = new Map<number, PartStock>();
  const usageCost = new Map<number, number>();
  const get = (partId: number) => {
    let s = byPart.get(partId);
    if (!s) {
      s = { partId, qty: 0, avgCost: 0, value: 0, totalIn: 0, totalOut: 0 };
      byPart.set(partId, s);
    }
    return s;
  };

  for (const x of txns) {
    const s = get(x.t.partId);
    if (x.kind === 'in') {
      s.qty += x.t.qty;
      s.value += x.t.qty * x.t.unitCost;
      s.totalIn += x.t.qty;
      s.avgCost = s.qty > 0 ? s.value / s.qty : x.t.unitCost;
    } else {
      const cost = x.t.qty * s.avgCost;
      s.qty -= x.t.qty;
      s.value = s.qty > 0 ? s.value - cost : 0;
      s.totalOut += x.t.qty;
      if (x.t.id != null) usageCost.set(x.t.id, cost);
    }
  }

  let totalValue = 0;
  for (const s of byPart.values()) totalValue += s.value;
  return { byPart, usageCost, totalValue };
}

export const rupiah = (n: number) =>
  'Rp ' + Math.round(n).toLocaleString('id-ID');

export const today = () => new Date().toISOString().slice(0, 10);
