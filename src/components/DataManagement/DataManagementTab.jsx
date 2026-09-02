import { useRef, useState } from 'react';
import useStore from '../../store/useStore';
import {
  extractStock,
  extractCustomCategories,
  extractCustomProducts,
  extractCustomVariations,
  extractVariationMeta,
  extractProductMeta,
  fetchCatalog,
} from '../../utils/catalog';
import {
  exportDataAsJson,
  exportSalesAsCsv,
  exportIkramsAsCsv,
  parseImportFile,
} from '../../utils/exportImport';

export default function DataManagementTab() {
  const categories = useStore((s) => s.categories);
  const sales = useStore((s) => s.sales);
  const ikrams = useStore((s) => s.ikrams);
  const ikramRecipients = useStore((s) => s.ikramRecipients);
  const removedCatalogCategories = useStore((s) => s.removedCatalogCategories);
  const removedCatalogProducts = useStore((s) => s.removedCatalogProducts);
  const removedCatalogVariations = useStore((s) => s.removedCatalogVariations);
  const theme = useStore((s) => s.theme);
  const importData = useStore((s) => s.importData);
  const resetData = useStore((s) => s.resetData);

  const fileInputRef = useRef(null);
  const [message, setMessage] = useState(null);

  const totalStock = categories.reduce(
    (sum, c) => sum + (c.products || []).reduce((s, p) => s + (p.varieties || []).reduce((vs, v) => vs + v.stock, 0), 0),
    0
  );

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExportJson = async () => {
    const catalog = await fetchCatalog();
    exportDataAsJson({
      stock: extractStock(categories),
      sales,
      ikrams,
      ikramRecipients,
      customCategories: extractCustomCategories(categories),
      customProducts: extractCustomProducts(categories),
      customVariations: extractCustomVariations(categories),
      variationMeta: extractVariationMeta(catalog.categories, categories),
      productMeta: extractProductMeta(categories),
      removedCatalogCategories,
      removedCatalogProducts,
      removedCatalogVariations,
      theme,
    });
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

  const handleExportIkramCsv = () => {
    if (ikrams.length === 0) {
      showMessage('error', 'Dışa aktarılacak ikram verisi yok');
      return;
    }
    exportIkramsAsCsv(ikrams);
    showMessage('success', 'CSV ikram raporu indirildi ✓');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseImportFile(file);
      if (confirm('Mevcut stok, satış ve ikram verilerinin üzerine yazılacak. Devam?')) {
        await importData(data);
        showMessage('success', 'Veriler başarıyla geri yüklendi ✓');
      }
    } catch (err) {
      showMessage('error', err.message);
    }

    e.target.value = '';
  };

  const handleReset = async () => {
    if (confirm('Tüm stok, satış ve ikram kayıtları silinecek. Emin misiniz?')) {
      await resetData();
      showMessage('success', 'Stok, satış ve ikramlar sıfırlandı ✓');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Veri Yönetimi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Stok, satış ve ikram yedekleme
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryItem label="Kategori" value={categories.length} />
          <SummaryItem
            label="Ürün"
            value={categories.reduce((s, c) => s + (c.products || []).length, 0)}
          />
          <SummaryItem label="Stok" value={totalStock} />
          <SummaryItem label="Satış Kaydı" value={sales.length} />
          <SummaryItem label="İkram Kaydı" value={ikrams.length} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-bold">Dışa Aktar</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Stok, satış ve ikram geçmişini yedekleyin
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={handleExportJson} className="btn-primary flex-1">
            📥 JSON Yedek İndir
          </button>
          <button type="button" onClick={handleExportCsv} className="btn-secondary flex-1">
            📊 Satışları CSV İndir
          </button>
          <button type="button" onClick={handleExportIkramCsv} className="btn-secondary flex-1">
            🎁 İkramları CSV İndir
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-bold">İçe Aktar</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          JSON yedek dosyasından verileri geri yükleyin
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
          Stok, satış ve ikram kayıtlarını sıfırlar (kategoriler değişmez)
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 w-full rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          Stok, Satış & İkramları Sıfırla
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-center dark:border dark:border-white/5 dark:bg-slate-800">
      <p className="text-xl font-bold accent-text">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
