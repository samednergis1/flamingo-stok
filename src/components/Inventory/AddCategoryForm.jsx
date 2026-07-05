import { useState } from 'react';
import useStore from '../../store/useStore';

export default function AddCategoryForm() {
  const addCategory = useStore((s) => s.addCategory);
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addCategory(name)) setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="category-name" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
          Yeni Kategori
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ör. Krep, İçecekler..."
          className="input-field"
        />
      </div>
      <button type="submit" className="btn-primary shrink-0" disabled={!name.trim()}>
        + Kategori Ekle
      </button>
    </form>
  );
}
