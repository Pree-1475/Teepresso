import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, ChevronUp, ChevronDown, Check } from 'lucide-react';
import styles from '../products/ProductsAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface SizeSnippet {
  id: string;
  name: string;
  category: string;
}

export function SizesSnippetPage() {
  const [sizes, setSizes] = useState<SizeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic categories state
  const [sizeCategories, setSizeCategories] = useState<string[]>([
    'Kids Sizes',
    'Adult Standard',
    'Adult Plus (Special)'
  ]);

  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form State for Sizes
  const [editId, setEditId] = useState<string | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputCategory, setInputCategory] = useState('Adult Standard');
  const [saving, setSaving] = useState(false);

  // Form State for Category Management
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryIndex, setEditCategoryIndex] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Fetch sizes and categories on mount
  useEffect(() => {
    fetchSizesAndCategories();
  }, []);

  const fetchSizesAndCategories = async () => {
    setLoading(true);
    try {
      // Fetch dynamic categories
      const settingsRes = await fetch(`${API_BASE_URL}/settings`);
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings && Array.isArray(settingsData.settings.sizeCategories)) {
        setSizeCategories(settingsData.settings.sizeCategories);
        if (settingsData.settings.sizeCategories.length > 0) {
          setInputCategory(settingsData.settings.sizeCategories[0]);
        }
      }

      // Fetch size list
      const sizesRes = await fetch(`${API_BASE_URL}/sizes`);
      const sizesData = await sizesRes.json();
      if (sizesData.success && Array.isArray(sizesData.sizes)) {
        setSizes(sizesData.sizes);
      } else {
        setError(sizesData.message || 'Failed to load sizes');
      }
    } catch (err) {
      console.error(err);
      setError('Network error: failed to load database snippets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const isEdit = !!editId;
      const url = isEdit 
        ? `${API_BASE_URL}/sizes/${editId}` 
        : `${API_BASE_URL}/sizes`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName.trim(), category: inputCategory })
      });
      const data = await res.json();

      if (data.success) {
        setInputName('');
        setEditId(null);
        // Reset category to first available
        if (sizeCategories.length > 0) {
          setInputCategory(sizeCategories[0]);
        }
        // Refresh sizes
        const sizesRes = await fetch(`${API_BASE_URL}/sizes`);
        const sizesData = await sizesRes.json();
        if (sizesData.success && Array.isArray(sizesData.sizes)) {
          setSizes(sizesData.sizes);
        }
      } else {
        setError(data.message || 'Failed to save size');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to communicate with the server.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (sz: SizeSnippet) => {
    setEditId(sz.id);
    setInputName(sz.name);
    setInputCategory(sz.category || (sizeCategories.length > 0 ? sizeCategories[0] : ''));
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setInputName('');
    if (sizeCategories.length > 0) {
      setInputCategory(sizeCategories[0]);
    }
  };

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'size' | 'category'; title: string; payload: any } | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'size') {
      try {
        const res = await fetch(`${API_BASE_URL}/sizes/${deleteTarget.payload.id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          setDeleteTarget(null);
          // Refresh sizes
          const sizesRes = await fetch(`${API_BASE_URL}/sizes`);
          const sizesData = await sizesRes.json();
          if (sizesData.success && Array.isArray(sizesData.sizes)) {
            setSizes(sizesData.sizes);
          }
        } else {
          setError(data.message || 'Failed to delete size');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to delete size');
      }
    } else if (deleteTarget.type === 'category') {
      const updated = sizeCategories.filter(c => c !== deleteTarget.payload);
      handleSaveCategories(updated);
      setDeleteTarget(null);
    }
  };

  // CATEGORY ACTIONS
  const handleSaveCategories = async (updatedList: string[]) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizeCategories: updatedList })
      });
      const data = await res.json();
      if (data.success) {
        setSizeCategories(updatedList);
        if (updatedList.length > 0 && !updatedList.includes(inputCategory)) {
          setInputCategory(updatedList[0]);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save categories list');
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (sizeCategories.includes(trimmed)) {
      alert('Category already exists');
      return;
    }
    const updated = [...sizeCategories, trimmed];
    handleSaveCategories(updated);
    setNewCategoryName('');
  };

  const handleStartEditCategory = (index: number) => {
    setEditCategoryIndex(index);
    setEditCategoryName(sizeCategories[index]);
  };

  const handleUpdateCategory = async (index: number) => {
    const trimmed = editCategoryName.trim();
    if (!trimmed) return;
    const oldName = sizeCategories[index];
    if (oldName === trimmed) {
      setEditCategoryIndex(null);
      return;
    }
    const updated = [...sizeCategories];
    updated[index] = trimmed;
    await handleSaveCategories(updated);

    // Update category for any sizes currently using oldName
    const sizesToUpdate = sizes.filter(s => s.category === oldName);
    for (const sz of sizesToUpdate) {
      await fetch(`${API_BASE_URL}/sizes/${sz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: trimmed })
      });
    }

    // Refresh size list
    const sizesRes = await fetch(`${API_BASE_URL}/sizes`);
    const sizesData = await sizesRes.json();
    if (sizesData.success && Array.isArray(sizesData.sizes)) {
      setSizes(sizesData.sizes);
    }

    setEditCategoryIndex(null);
  };

  // NATIVE HTML5 DRAG & DROP HANDLERS (LIVE SORTING)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...sizes];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setSizes(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await saveNewOrder(sizes);
  };

  // ACCESSIBILITY REARRANGE BUTTONS (UP / DOWN)
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...sizes];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index - 1, 0, item);

    setSizes(reordered);
    await saveNewOrder(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === sizes.length - 1) return;
    const reordered = [...sizes];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index + 1, 0, item);

    setSizes(reordered);
    await saveNewOrder(reordered);
  };

  const saveNewOrder = async (orderedList: SizeSnippet[]) => {
    try {
      const orderedIds = orderedList.map(s => s.id);
      await fetch(`${API_BASE_URL}/sizes/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {
      console.error('Failed to save new size order:', err);
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Snippet Manager: Sizes</h1>
          <p className={styles.subtitle}>Define size labels and configure dynamic pricing categories</p>
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
            <div style={{ padding: '24px' }} className="text-muted">Loading sizes list...</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Order</th>
                  <th>Size ID</th>
                  <th>Size Name</th>
                  <th>Pricing Category</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((sz, idx) => (
                  <tr 
                    key={sz.id}
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
                          disabled={idx === sizes.length - 1}
                          style={{
                            padding: '2px',
                            color: idx === sizes.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                            cursor: idx === sizes.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="text-mono text-muted">{sz.id}</td>
                    <td style={{ fontWeight: 600 }}>{sz.name}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '11px', fontWeight: 600 }}>
                        {sz.category || 'Adult Standard'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEditClick(sz)}
                          className={styles.moreBtn}
                          style={{ padding: '6px', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget({ type: 'size', title: sz.name, payload: sz })}
                          className={styles.moreBtn}
                          style={{ padding: '6px', color: 'var(--color-status-danger)', cursor: 'pointer' }}
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

        {/* Right Side: Add/Edit Form Panel & Category Manager */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.formPanelTitle}>{editId ? 'Edit Size' : 'Create New Size'}</span>
            {editId && (
              <button onClick={handleCancelEdit} style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <form onSubmit={handleSaveSize} className={styles.formPanelBody}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Size Label *</label>
              <input
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                required
                placeholder="e.g. XL, 40, 2Y"
                className={styles.formInput}
              />
              <span className={styles.formHelp}>The size code displayed to customer and production teams.</span>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel}>Sizing Category Group</label>
              <select
                value={inputCategory}
                onChange={e => setInputCategory(e.target.value)}
                className={styles.formInput}
              >
                {sizeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className={styles.formHelp}>Group sizes for organized customer selection.</span>
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
                <span>{saving ? 'Saving...' : editId ? 'Update' : 'Create Size'}</span>
              </button>
            </div>
          </form>

          {/* Manage Categories Section */}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '20px', paddingTop: '20px' }}>
            <div className={styles.formPanelHeader} style={{ background: 'transparent', padding: '0 24px 16px 24px', border: 'none' }}>
              <span className={styles.formPanelTitle}>Manage Size Groups</span>
            </div>
            <div className={styles.formPanelBody} style={{ paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {sizeCategories.map((cat, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      backgroundColor: 'var(--color-surface-hover)', 
                      padding: '8px 12px', 
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {editCategoryIndex === idx ? (
                      <div style={{ display: 'flex', gap: '6px', flex: 1, marginRight: '8px' }}>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={e => setEditCategoryName(e.target.value)}
                          className={styles.formInput}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => handleUpdateCategory(idx)}
                          style={{ padding: '4px', cursor: 'pointer', color: 'var(--color-primary)' }}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditCategoryIndex(null)}
                          style={{ padding: '4px', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-title)' }}>{cat}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditCategory(idx)}
                            className={styles.moreBtn}
                            style={{ padding: '4px', cursor: 'pointer' }}
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ type: 'category', title: cat, payload: cat })}
                            className={styles.moreBtn}
                            style={{ padding: '4px', color: 'var(--color-status-danger)', cursor: 'pointer' }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add category block */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                <input
                  type="text"
                  placeholder="e.g. Adult Premium"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className={styles.formInput}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="erp-btn-primary"
                  style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px 16px' }}
                >
                  <Plus size={12} />
                  <span>Add Group</span>
                </button>
              </div>

            </div>
          </div>
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
                Confirm {deleteTarget.type === 'size' ? 'Size' : 'Group'} Deletion
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
                <strong>WARNING:</strong> Are you sure you want to delete {deleteTarget.type === 'size' ? 'size' : 'sizing group'} <strong>"{deleteTarget.title}"</strong>? This action cannot be undone.
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
export default SizesSnippetPage;
