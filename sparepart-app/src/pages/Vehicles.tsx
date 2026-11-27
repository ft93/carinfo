import { useState } from 'react';
import { db } from '../db';
import { useData } from '../hooks';
import { rupiah } from '../stock';

export default function Vehicles() {
  const d = useData();
  const [f, setF] = useState({ plate: '', brand: '', model: '', year: '', owner: '' });
  const [open, setOpen] = useState<number | null>(null);
  const [err, setErr] = useState('');
  if (!d) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await db.vehicles.add({
        plate: f.plate.replace(/\s+/g, ' ').trim().toUpperCase(),
        brand: f.brand.trim(), model: f.model.trim(), owner: f.owner.trim(),
        year: f.year ? +f.year : undefined, createdAt: Date.now(),
      });
      setF({ plate: '', brand: '', model: '', year: '', owner: '' });
      setErr('');
    } catch {
      setErr('Nomor polisi sudah terdaftar.');
    }
  }

  const partName = (id: number) => d.parts.find((p) => p.id === id)?.name ?? '?';

  return (
    <>
      <form className="card form" onSubmit={save}>
        <h2>Tambah mobil</h2>
        <input required placeholder="Nomor polisi (B 1234 XYZ)" value={f.plate} onChange={(e) => setF({ ...f, plate: e.target.value })} />
        <div className="row">
          <input required placeholder="Merek" value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} />
          <input required placeholder="Tipe" value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} />
        </div>
        <div className="row">
          <input type="number" placeholder="Tahun" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} />
          <input placeholder="Pemilik" value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} />
        </div>
        {err && <p className="warn">{err}</p>}
        <button>Simpan</button>
      </form>
      <section className="card">
        <h2>Daftar mobil</h2>
        <ul className="list">
          {d.vehicles.map((v) => {
            const us = d.usages.filter((u) => u.vehicleId === v.id).sort((a, b) => b.date.localeCompare(a.date));
            const total = us.reduce((s, u) => s + (d.ledger.usageCost.get(u.id!) ?? 0), 0);
            return (
              <li key={v.id} className="col" onClick={() => setOpen(open === v.id ? null : v.id!)}>
                <div className="between">
                  <span>{v.plate}<br /><small className="muted">{v.brand} {v.model} {v.year ?? ''} · {v.owner || '-'}</small></span>
                  <span className="right"><b>{rupiah(total)}</b><br /><small className="muted">{us.length} item</small></span>
                </div>
                {open === v.id && (
                  <ul className="sub">
                    {us.length === 0 && <li className="muted">Belum ada pemakaian.</li>}
                    {us.map((u) => (
                      <li key={u.id}>
                        <span>{u.date} · {u.job}<br /><small>{partName(u.partId)} × {u.qty}</small></span>
                        <span>{rupiah(d.ledger.usageCost.get(u.id!) ?? 0)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
