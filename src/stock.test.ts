import { describe, it, expect } from 'vitest';
import { computeLedger } from './stock';

describe('computeLedger (moving average)', () => {
  it('menghitung rata-rata tertimbang dan HPP pemakaian', () => {
    const purchases = [
      { id: 1, date: '2026-01-01', partId: 1, qty: 10, unitCost: 50000, createdAt: 1 },
      { id: 2, date: '2026-01-05', partId: 1, qty: 10, unitCost: 60000, createdAt: 2 },
    ];
    const usages = [
      { id: 1, date: '2026-01-03', partId: 1, qty: 4, vehicleId: 1, job: 'Ganti oli', createdAt: 3 },
      { id: 2, date: '2026-01-06', partId: 1, qty: 6, vehicleId: 2, job: 'Ganti oli', createdAt: 4 },
    ];
    const l = computeLedger(purchases, usages);
    // 01-03: pakai 4 @50.000 = 200.000, sisa 6 senilai 300.000
    expect(l.usageCost.get(1)).toBe(200000);
    // 01-05: beli 10 @60.000 -> 16 unit, nilai 900.000, avg 56.250
    // 01-06: pakai 6 @56.250 = 337.500
    expect(l.usageCost.get(2)).toBe(337500);
    const s = l.byPart.get(1)!;
    expect(s.qty).toBe(10);
    expect(s.value).toBe(562500);
    expect(l.totalValue).toBe(562500);
  });

  it('pembelian di tanggal yang sama diproses sebelum pemakaian', () => {
    const l = computeLedger(
      [{ id: 1, date: '2026-02-01', partId: 7, qty: 2, unitCost: 1000, createdAt: 5 }],
      [{ id: 1, date: '2026-02-01', partId: 7, qty: 1, vehicleId: 1, job: 'x', createdAt: 1 }],
    );
    expect(l.usageCost.get(1)).toBe(1000);
    expect(l.byPart.get(7)!.qty).toBe(1);
  });
});
