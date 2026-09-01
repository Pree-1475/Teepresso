import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import styles from '../products/ProductsAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface Category {
  id: string;
  name: string;
}

export function CategoriesSnippetPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [inputName, setInputName] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setError(data.message || 'Failed to load categories');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Network error: failed to fetch categories.');
      })
      .finally(() => setLoading(false));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const isEdit = !!editId;
      const url = isEdit 
        ? `${API_BASE_URL}/categories/${editId}` 
        : `${API_BASE_URL}/categories`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setInputName('');
        setEditId(null);
        fetchCategories();
      } else {
        setError(data.message || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to communicate with the server.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditId(cat.id);
    setInputName(cat.name);
  };

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleCancelEdit = () => {
    setEditId(null);
    setInputName('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`${API_BASE_URL}/categories/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchCategories();
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete category');
    }
  };

  // NATIVE HTML5 DRAG & DROP HANDLERS (LIVE SORTING)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...categories];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setCategories(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await saveNewOrder(categories);
  };

  // ACCESSIBILITY REARRANGE BUTTONS (UP / DOWN)
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...categories];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index - 1, 0, item);

    setCategories(reordered);
    await saveNewOrder(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const reordered = [...categories];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index + 1, 0, item);

    setCategories(reordered);
    await saveNewOrder(reordered);
  };

  const saveNewOrder = async (orderedList: Category[]) => {
    try {
      const orderedIds = orderedList.map(c => c.id);
      await fetch(`${API_BASE_URL}/categories/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {
      console.error('Failed to save new category order:', err);
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Snippet Manager: Categories</h1>
          <p className={styles.subtitle}>Define, drag, and rearrange custom categories for your dynamic storefront and catalog</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-status-danger-bg)', borderLeft: '4px solid var(--color-status-danger)', color: 'var(--color-status-danger)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Table List */}
        <div className="erp-table-container">
          {loading ? (
            <div style={{ padding: '24px' }} className="text-muted">Loading categories list...</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th> {/* Drag Handle */}
                  <th>Order controls</th>
                  <th>Category ID / Slug</th>
                  <th>Category Display Name</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr 
                    key={cat.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      opacity: draggedIndex === idx ? 0.4 : 1,
                      cursor: 'grab',
                      backgroundColor: draggedIndex === idx ? 'var(--color-surface-hover)' : 'transparent'
                    }}
                  >
                    <td>
                      <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                        <GripVertical size={14} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          style={{
                            padding: '2px',
                            color: idx === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === categories.length - 1}
                          style={{
                            padding: '2px',
                            color: idx === categories.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                            cursor: idx === categories.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="text-mono text-muted">{cat.id}</td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEditClick(cat)}
                          className={styles.moreBtn}
                          style={{ padding: '6px', cursor: 'pointer' }}
                          title="Edit Category Name"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(cat)}
                          className={styles.moreBtn}
                          style={{ padding: '6px', color: 'var(--color-status-danger)', cursor: 'pointer' }}
                          title="Delete Category"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Side: Add/Edit Form Panel */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.formPanelTitle}>{editId ? 'Edit Category' : 'Create New Category'}</span>
            {editId && (
              <button onClick={handleCancelEdit} style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <form onSubmit={handleSave} className={styles.formPanelBody}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Category Name</label>
              <input
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                required
                placeholder="e.g. Activewear, Caps"
                className={styles.formInput}
              />
              <span className={styles.formHelp}>The user-facing title of the category.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              {editId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="erp-btn-secondary"
                  style={{ padding: '8px 16px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={saving}
                className="erp-btn-primary"
                style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 20px', cursor: 'pointer' }}
              >
                <Save size={13} />
                <span>{saving ? 'Saving...' : editId ? 'Update' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Wagtail-style Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text-title)', fontFamily: 'var(--font-mono)' }}>
                Confirm Category Deletion
              </h3>
              <button 
                type="button" 
                onClick={() => setDeleteTarget(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                backgroundColor: 'rgba(192, 57, 43, 0.08)',
                borderLeft: '4px solid var(--color-status-danger)',
                padding: '12px 16px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '13px',
                color: 'var(--color-status-danger)'
              }}>
                <strong>WARNING:</strong> Are you sure you want to delete category snippet <strong>"{deleteTarget.name}"</strong>? This action cannot be undone and may affect catalog items.
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              backgroundColor: 'var(--color-surface-beige)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                className="erp-btn-secondary"
                onClick={() => setDeleteTarget(null)}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="erp-btn-primary"
                onClick={confirmDelete}
                style={{ 
                  padding: '8px 20px', 
                  backgroundColor: 'var(--color-status-danger)', 
                  borderColor: 'var(--color-status-danger)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Delete Snippet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default CategoriesSnippetPage;
