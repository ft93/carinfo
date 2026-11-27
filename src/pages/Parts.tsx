import { useState } from 'react';
import { db } from '../db';
import { useData } from '../hooks';
import { rupiah } from '../stock';

export default function Parts() {
  const d = useData();
  const [f, setF] = useState({ sku: '', name: '', unit: 'pcs', minStock: 0 });
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  if (!d) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await db.parts.add({ ...f, sku: f.sku.trim().toUpperCase(), name: f.name.trim(), createdAt: Date.now() });
      setF({ sku: '', name: '', unit: 'pcs', minStock: 0 });
      setErr('');
    } catch {
      setErr('Kode/SKU sudah dipakai.');
    }
  }

  async function remove(id: number) {
    const used = (await db.purchases.where('partId').equals(id).count()) + (await db.usages.where('partId').equals(id).count());
    if (used) return alert('Sparepart sudah punya transaksi, tidak bisa dihapus.');
    if (confirm('Hapus sparepart ini?')) await db.parts.delete(id);
  }

  const list = d.parts.filter((p) => (p.name + p.sku).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <form className="card form" onSubmit={save}>
        <h2>Tambah sparepart</h2>
        <input required placeholder="Kode / SKU (mis. OLI-SHL-1L)" value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} />
        <input required placeholder="Nama sparepart" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <div className="row">
          <label>Satuan<input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></label>
          <label>Stok minimum<input type="number" min={0} value={f.minStock} onChange={(e) => setF({ ...f, minStock: +e.target.value })} /></label>
        </div>
        {err && <p className="warn">{err}</p>}
        <button>Simpan</button>
      </form>
      <section className="card">
        <input placeholder="Cari..." value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="list">
          {list.map((p) => {
            const s = d.ledger.byPart.get(p.id!);
            return (
              <li key={p.id}>
                <span>
                  {p.name}<br />
                  <small className="muted">{p.sku} · avg {rupiah(s?.avgCost ?? 0)}</small>
                </span>
                <span className="right">
                  <b className={(s?.qty ?? 0) <= p.minStock ? 'warn' : ''}>{s?.qty ?? 0} {p.unit}</b><br />
                  <button className="link" onClick={() => remove(p.id!)}>hapus</button>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
