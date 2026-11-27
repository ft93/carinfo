import { useState } from 'react';
import { db } from '../db';
import { useData } from '../hooks';
import { rupiah, today } from '../stock';

const empty = () => ({ date: today(), partId: 0, qty: 1, unitCost: 0, supplier: '', note: '' });

export default function Purchases() {
  const d = useData();
  const [f, setF] = useState(empty());
  if (!d) return null;
  const partName = (id: number) => d.parts.find((p) => p.id === id)?.name ?? '?';

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await db.purchases.add({ ...f, createdAt: Date.now() });
    setF({ ...empty(), date: f.date, supplier: f.supplier });
  }

  const list = [...d.purchases].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  return (
    <>
      <form className="card form" onSubmit={save}>
        <h2>Catat pembelian</h2>
        {d.parts.length === 0 && <p className="warn">Tambah sparepart dulu di menu Sparepart.</p>}
        <input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <select required value={f.partId || ''} onChange={(e) => setF({ ...f, partId: +e.target.value })}>
          <option value="">Pilih sparepart...</option>
          {d.parts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
        </select>
        <div className="row">
          <label>Qty<input type="number" min={0.01} step="any" required value={f.qty} onChange={(e) => setF({ ...f, qty: +e.target.value })} /></label>
          <label>Harga / unit (Rp)<input type="number" min={0} step="any" required value={f.unitCost} onChange={(e) => setF({ ...f, unitCost: +e.target.value })} /></label>
        </div>
        <input placeholder="Supplier / toko" value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} />
        <input placeholder="Catatan / no. nota" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        <p className="muted">Total: {rupiah(f.qty * f.unitCost)}</p>
        <button>Simpan pembelian</button>
      </form>
      <section className="card">
        <h2>Riwayat pembelian</h2>
        <ul className="list">
          {list.map((p) => (
            <li key={p.id}>
              <span>
                {partName(p.partId)}<br />
                <small className="muted">{p.date} · {p.supplier || '-'} · {p.qty} × {rupiah(p.unitCost)}</small>
              </span>
              <span className="right">
                <b>{rupiah(p.qty * p.unitCost)}</b><br />
                <button className="link" onClick={() => confirm('Hapus transaksi?') && db.purchases.delete(p.id!)}>hapus</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
