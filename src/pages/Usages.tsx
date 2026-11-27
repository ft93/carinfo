import { useState } from 'react';
import { db } from '../db';
import { useData } from '../hooks';
import { rupiah, today } from '../stock';

const JOBS = ['Servis berkala', 'Ganti oli', 'Rem', 'Kaki-kaki', 'Kelistrikan', 'AC', 'Mesin', 'Body'];
const empty = () => ({ date: today(), partId: 0, qty: 1, vehicleId: 0, job: '', mechanic: '', note: '' });

export default function Usages() {
  const d = useData();
  const [f, setF] = useState(empty());
  const [err, setErr] = useState('');
  if (!d) return null;
  const part = (id: number) => d.parts.find((p) => p.id === id);
  const plate = (id: number) => d.vehicles.find((v) => v.id === id)?.plate ?? '?';
  const stock = f.partId ? d.ledger.byPart.get(f.partId) : undefined;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if ((stock?.qty ?? 0) < f.qty) return setErr(`Stok tidak cukup (sisa ${stock?.qty ?? 0}).`);
    await db.usages.add({ ...f, job: f.job.trim(), createdAt: Date.now() });
    setErr('');
    setF({ ...empty(), date: f.date, vehicleId: f.vehicleId, job: f.job, mechanic: f.mechanic });
  }

  const list = [...d.usages].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  return (
    <>
      <form className="card form" onSubmit={save}>
        <h2>Catat pemakaian</h2>
        {d.vehicles.length === 0 && <p className="warn">Tambah mobil dulu di menu Mobil.</p>}
        <input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <select required value={f.vehicleId || ''} onChange={(e) => setF({ ...f, vehicleId: +e.target.value })}>
          <option value="">Ke mobil mana...</option>
          {d.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate} – {v.brand} {v.model}</option>)}
        </select>
        <input required list="jobs" placeholder="Dipakai untuk (pekerjaan)" value={f.job} onChange={(e) => setF({ ...f, job: e.target.value })} />
        <datalist id="jobs">{JOBS.map((j) => <option key={j} value={j} />)}</datalist>
        <select required value={f.partId || ''} onChange={(e) => setF({ ...f, partId: +e.target.value })}>
          <option value="">Pilih sparepart...</option>
          {d.parts.map((p) => (
            <option key={p.id} value={p.id}>{p.name} (stok {d.ledger.byPart.get(p.id!)?.qty ?? 0})</option>
          ))}
        </select>
        <div className="row">
          <label>Qty<input type="number" min={0.01} step="any" required value={f.qty} onChange={(e) => setF({ ...f, qty: +e.target.value })} /></label>
          <label>Mekanik<input value={f.mechanic} onChange={(e) => setF({ ...f, mechanic: e.target.value })} /></label>
        </div>
        {stock && <p className="muted">Estimasi biaya: {rupiah(f.qty * stock.avgCost)} (avg {rupiah(stock.avgCost)})</p>}
        {err && <p className="warn">{err}</p>}
        <button>Simpan pemakaian</button>
      </form>
      <section className="card">
        <h2>Riwayat pemakaian</h2>
        <ul className="list">
          {list.map((u) => (
            <li key={u.id}>
              <span>
                {part(u.partId)?.name ?? '?'} × {u.qty}<br />
                <small className="muted">{u.date} · {plate(u.vehicleId)} · {u.job}{u.mechanic ? ' · ' + u.mechanic : ''}</small>
              </span>
              <span className="right">
                <b>{rupiah(d.ledger.usageCost.get(u.id!) ?? 0)}</b><br />
                <button className="link" onClick={() => confirm('Hapus transaksi?') && db.usages.delete(u.id!)}>hapus</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
