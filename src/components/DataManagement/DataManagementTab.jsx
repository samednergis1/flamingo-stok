import { useRef, useState } from 'react';
import useStore from '../../store/useStore';
import { extractStock } from '../../utils/catalog';
import { exportDataAsJson, exportSalesAsCsv, parseImportFile } from '../../utils/exportImport';

export default function DataManagementTab() {
  const categories = useStore((s) => s.categories);
  const sales = useStore((s) => s.sales);
  const theme = useStore((s) => s.theme);
  const importData = useStore((s) => s.importData);
  const resetData = useStore((s) => s.resetData);

  const fileInputRef = useRef(null);
  const [message, setMessage] = useState(null);

  const totalStock = categories.reduce(
    (sum, c) => sum + c.variations.reduce((s, v) => s + v.stock, 0),
    0
  );

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExportJson = () => {
    exportDataAsJson({ stock: extractStock(categories), sales, theme });
    showMessage('success', 'JSON yedek indirildi ✓');
  };

  const handleExportCsv = () => {
    if (sales.length === 0) {
      showMessage('error', 'Dışa aktarılacak satış verisi yok');
      return;
    }
    exportSalesAsCsv(sales);
    showMessage('success', 'CSV satış raporu indirildi ✓');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseImportFile(file);
      if (confirm('Mevcut stok ve satış verilerinin üzerine yazılacak. Devam?')) {
        await importData(data);
        showMessage('success', 'Veriler başarıyla geri yüklendi ✓');
      }
    } catch (err) {
      showMessage('error', err.message);
    }

    e.target.value = '';
  };

  const handleReset = async () => {
    if (confirm('Tüm stok ve satış kayıtları silinecek. Emin misiniz?')) {
      await resetData();
      showMessage('success', 'Stok ve satışlar sıfırlandı ✓');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Veri Yönetimi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Stok ve satış yedekleme
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="card">
        <h3 className="mb-3 font-bold">Veri Özeti</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryItem label="Kategori" value={categories.length} />
          <SummaryItem
            label="Çeşit"
            value={categories.reduce((s, c) => s + c.variations.length, 0)}
          />
          <SummaryItem label="Toplam Stok" value={totalStock} />
          <SummaryItem label="Satış Kaydı" value={sales.length} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-bold">Dışa Aktar</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Stok miktarları ve satış geçmişini yedekleyin
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={handleExportJson} className="btn-primary flex-1">
            📥 JSON Yedek İndir
          </button>
          <button type="button" onClick={handleExportCsv} className="btn-secondary flex-1">
            📊 Satışları CSV İndir
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-bold">İçe Aktar</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          JSON yedek dosyasından stok ve satışları geri yükleyin
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full"
        >
          📤 JSON Dosyası Seç & Geri Yükle
        </button>
      </div>

      <div className="card border-red-200 dark:border-red-900">
        <h3 className="font-bold text-red-600 dark:text-red-400">Tehlikeli Bölge</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Stok ve satış kayıtlarını sıfırlar (kategoriler değişmez)
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 w-full rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          Stok & Satışları Sıfırla
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-center dark:bg-gray-800">
      <p className="text-xl font-bold accent-text">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
