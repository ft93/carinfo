import { useRef } from 'react';
import { exportBackup, importBackup } from '../db';
import { useData } from '../hooks';
import { rupiah } from '../stock';

function download(name: string, content: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Report() {
  const d = useData();
  const file = useRef<HTMLInputElement>(null);
  if (!d) return null;

  const rows = d.parts.map((p) => {
    const s = d.ledger.byPart.get(p.id!);
    return { p, qty: s?.qty ?? 0, avg: s?.avgCost ?? 0, value: s?.value ?? 0, tin: s?.totalIn ?? 0, tout: s?.totalOut ?? 0 };
  });

  function exportCsv() {
    const head = 'SKU;Nama;Satuan;Masuk;Keluar;Stok;Harga Rata2;Nilai Stok';
    const body = rows.map((r) => [r.p.sku, r.p.name, r.p.unit, r.tin, r.tout, r.qty, Math.round(r.avg), Math.round(r.value)].join(';'));
    download(`valuasi-stok-${new Date().toISOString().slice(0, 10)}.csv`, [head, ...body].join('\n'), 'text/csv');
  }

  async function backup() {
    download(`backup-sparepart-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(await exportBackup()), 'application/json');
  }

  async function restore(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !confirm('Restore akan MENGGANTI semua data saat ini. Lanjut?')) return;
    await importBackup(JSON.parse(await f.text()));
    alert('Data berhasil di-restore.');
  }

  return (
    <>
      <section className="card">
        <h2>Valuasi stok (rata-rata tertimbang)</h2>
        <div className="table">
          <table>
            <thead><tr><th>Sparepart</th><th>Stok</th><th>Avg</th><th>Nilai</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.p.id}>
                  <td>{r.p.name}<br /><small className="muted">{r.p.sku}</small></td>
                  <td>{r.qty} {r.p.unit}</td>
                  <td>{rupiah(r.avg)}</td>
                  <td>{rupiah(r.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan={3}>Total nilai stok</td><td>{rupiah(d.ledger.totalValue)}</td></tr></tfoot>
          </table>
        </div>
        <button onClick={exportCsv}>Export CSV (Excel)</button>
      </section>
      <section className="card form">
        <h2>Backup data</h2>
        <p className="muted">Data tersimpan di perangkat ini. Backup rutin agar tidak hilang.</p>
        <button onClick={backup}>Download backup</button>
        <button className="secondary" onClick={() => file.current?.click()}>Restore dari file</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={restore} />
      </section>
    </>
  );
}
