import { useData } from '../hooks';
import { rupiah } from '../stock';

export default function Dashboard() {
  const d = useData();
  if (!d) return null;
  const { parts, usages, ledger } = d;
  const low = parts.filter((p) => (ledger.byPart.get(p.id!)?.qty ?? 0) <= p.minStock);
  const month = new Date().toISOString().slice(0, 7);
  const usedThisMonth = usages
    .filter((u) => u.date.startsWith(month))
    .reduce((s, u) => s + (ledger.usageCost.get(u.id!) ?? 0), 0);

  return (
    <>
      <div className="stats">
        <div className="stat"><small>Nilai stok</small><b>{rupiah(ledger.totalValue)}</b></div>
        <div className="stat"><small>Pemakaian bulan ini</small><b>{rupiah(usedThisMonth)}</b></div>
        <div className="stat"><small>Jenis sparepart</small><b>{parts.length}</b></div>
        <div className="stat"><small>Stok menipis</small><b className={low.length ? 'warn' : ''}>{low.length}</b></div>
      </div>
      <section className="card">
        <h2>Perlu restock</h2>
        {low.length === 0 ? <p className="muted">Semua stok aman.</p> : (
          <ul className="list">
            {low.map((p) => (
              <li key={p.id}>
                <span>{p.name} <small className="muted">{p.sku}</small></span>
                <b className="warn">{ledger.byPart.get(p.id!)?.qty ?? 0} {p.unit}</b>
              </li>
            ))}
          </ul>
        )}
      </section>
      {parts.length === 0 && (
        <section className="card">
          <h2>Mulai</h2>
          <ol>
            <li>Tambah master di <a href="#part">Sparepart</a> dan <a href="#mobil">Mobil</a></li>
            <li>Catat pembelian di <a href="#beli">Beli</a></li>
            <li>Catat pemakaian ke mobil di <a href="#pakai">Pakai</a></li>
          </ol>
        </section>
      )}
    </>
  );
}
