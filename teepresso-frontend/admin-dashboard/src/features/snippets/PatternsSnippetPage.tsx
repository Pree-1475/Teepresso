import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, ChevronUp, ChevronDown, Upload } from 'lucide-react';
import styles from '../products/ProductsAdminPage.module.css';

interface PatternSnippet {
  id: string;
  name: string;
  image: string;
}

export function PatternsSnippetPage() {
  const [patterns, setPatterns] = useState<PatternSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputImage, setInputImage] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch patterns on mount
  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/v1/patterns')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.patterns)) {
          setPatterns(data.patterns);
        } else {
          setError(data.message || 'Failed to load pattern snippets');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Network error: failed to fetch pattern list.');
      })
      .finally(() => setLoading(false));
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setInputImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputImage) {
      alert('Please provide both pattern title and an image.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const isEdit = !!editId;
      const url = isEdit 
        ? `http://localhost:5000/api/v1/patterns/${editId}` 
        : 'http://localhost:5000/api/v1/patterns';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inputName.trim(),
          image: inputImage
        })
      });

      const data = await res.json();
      if (data.success) {
        handleCancelEdit();
        fetchPatterns();
      } else {
        setError(data.message || 'Failed to save pattern snippet');
      }
    } catch (err) {
      console.error(err);
      setError('Network error while saving pattern snippet');
    } finally {
      setSaving(false);
    }
  };

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<PatternSnippet | null>(null);

  const handleEditClick = (pattern: PatternSnippet) => {
    setEditId(pattern.id);
    setInputName(pattern.name);
    setInputImage(pattern.image);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setInputName('');
    setInputImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`http://localhost:5000/api/v1/patterns/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchPatterns();
      } else {
        alert(data.message || 'Failed to delete pattern snippet');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting pattern snippet');
    }
  };

  // Reordering handlers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...patterns];
    const item = updated[index];
    updated.splice(index, 1);
    updated.splice(index - 1, 0, item);
    setPatterns(updated);
    saveOrder(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === patterns.length - 1) return;
    const updated = [...patterns];
    const item = updated[index];
    updated.splice(index, 1);
    updated.splice(index + 1, 0, item);
    setPatterns(updated);
    saveOrder(updated);
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...patterns];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setPatterns(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveOrder(patterns);
  };

  const saveOrder = async (orderedList: PatternSnippet[]) => {
    try {
      const orderedIds = orderedList.map(p => p.id);
      await fetch('http://localhost:5000/api/v1/patterns/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {
      console.error('Failed to save pattern reordering:', err);
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Snippet Manager: Patterns</h1>
          <p className={styles.subtitle}>Define custom print & weave patterns for Kurtas and Accessories</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-status-danger-bg)', borderLeft: '4px solid var(--color-status-danger)', color: 'var(--color-status-danger)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Grid: 3fr List (Left), 2fr Form (Right) - Exactly matching ColorsSnippetPage */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Table List */}
        <div className="erp-table-container">
          {loading ? (
            <div style={{ padding: '24px' }} className="text-muted">Loading patterns list...</div>
          ) : patterns.length === 0 ? (
            <div style={{ padding: '24px' }} className="text-muted">No pattern snippets found. Create your first pattern on the right.</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Order</th>
                  <th>Swatch</th>
                  <th>Pattern Title</th>
                  <th>ID Code</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((pat, idx) => (
                  <tr 
                    key={pat.id}
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
                          disabled={idx === patterns.length - 1}
                          style={{
                            padding: '2px',
                            color: idx === patterns.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                            cursor: idx === patterns.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <img 
                        src={pat.image} 
                        alt={pat.name} 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '4px', 
                          objectFit: 'cover', 
                          border: '1px solid var(--color-border)' 
                        }} 
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{pat.name}</td>
                    <td className="text-mono text-muted">{pat.id}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEditClick(pat)}
                          className={styles.moreBtn}
                          style={{ padding: '6px', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(pat)}
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

        {/* Right Side: Add/Edit Form Panel */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.formPanelTitle}>{editId ? 'Edit Pattern' : 'Create New Pattern'}</span>
            {editId && (
              <button onClick={handleCancelEdit} style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className={styles.formPanelBody}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Pattern Name *</label>
              <input
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                required
                placeholder="e.g. Bandhani Print"
                className={styles.formInput}
              />
              <span className={styles.formHelp}>The user-facing title of the print or weave pattern.</span>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel}>Pattern Swatch Image *</label>
              
              {inputImage ? (
                <div style={{ position: 'relative', width: '100%', height: '140px', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={inputImage} alt="Pattern Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setInputImage('')}
                    style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove Image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: '2px dashed var(--color-border)', borderRadius: '6px', padding: '20px', textAlign: 'center', backgroundColor: 'var(--color-surface-white)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                >
                  <Upload size={22} style={{ color: 'var(--color-primary)', marginBottom: '6px' }} />
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-title)' }}>Upload pattern swatch image</span>
                  <span className={styles.formHelp} style={{ display: 'block', marginTop: '4px' }}>PNG, JPG or WebP up to 5MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
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
                <span>{saving ? 'Saving...' : editId ? 'Update' : 'Create Pattern'}</span>
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
                Confirm Pattern Deletion
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
                <strong>WARNING:</strong> Are you sure you want to delete pattern snippet <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
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

export default PatternsSnippetPage;
