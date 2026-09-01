import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import styles from '../products/ProductsAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface ColorSnippet {
  id: string;
  name: string;
  hex: string;
}

// HSL to Hex and Hex to HSL color conversion helpers
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = (hex || '').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return { h: 20, s: 35, l: 40 };

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return { h: 20, s: 35, l: 40 };

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorsSnippetPage() {
  const [colors, setColors] = useState<ColorSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputHex, setInputHex] = useState('#8c5b45');
  const [saving, setSaving] = useState(false);

  // HSL state derived from inputHex
  const hsl = hexToHsl(inputHex);

  const updateHsl = (h: number, s: number, l: number) => {
    const newHex = hslToHex(h, s, l);
    setInputHex(newHex);
  };

  // Fetch colors on mount
  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/colors`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.colors)) {
          setColors(data.colors);
        } else {
          setError(data.message || 'Failed to load colors');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Network error: failed to fetch colors list.');
      })
      .finally(() => setLoading(false));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputHex.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const isEdit = !!editId;
      const url = isEdit 
        ? `${API_BASE_URL}/colors/${editId}` 
        : `${API_BASE_URL}/colors`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName.trim(), hex: inputHex.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setInputName('');
        setInputHex('');
        setEditId(null);
        fetchColors();
      } else {
        setError(data.message || 'Failed to save color');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to communicate with the server.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (col: ColorSnippet) => {
    setEditId(col.id);
    setInputName(col.name);
    setInputHex(col.hex);
  };

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ColorSnippet | null>(null);

  const handleCancelEdit = () => {
    setEditId(null);
    setInputName('');
    setInputHex('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`${API_BASE_URL}/colors/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchColors();
      } else {
        setError(data.message || 'Failed to delete color');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete color');
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

    const reordered = [...colors];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setColors(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await saveNewOrder(colors);
  };

  // ACCESSIBILITY REARRANGE BUTTONS (UP / DOWN)
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...colors];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index - 1, 0, item);

    setColors(reordered);
    await saveNewOrder(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === colors.length - 1) return;
    const reordered = [...colors];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index + 1, 0, item);

    setColors(reordered);
    await saveNewOrder(reordered);
  };

  const saveNewOrder = async (orderedList: ColorSnippet[]) => {
    try {
      const orderedIds = orderedList.map(c => c.id);
      await fetch(`${API_BASE_URL}/colors/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {
      console.error('Failed to save new color order:', err);
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Snippet Manager: Colors</h1>
          <p className={styles.subtitle}>Define custom color options and swatches for products</p>
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
            <div style={{ padding: '24px' }} className="text-muted">Loading colors list...</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Order</th>
                  <th>Swatch</th>
                  <th>Color Name</th>
                  <th>Hex Code</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((col, idx) => (
                  <tr 
                    key={col.id}
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
                          disabled={idx === colors.length - 1}
                          style={{
                            padding: '2px',
                            color: idx === colors.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                            cursor: idx === colors.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <span 
                        style={{ 
                          backgroundColor: col.hex, 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          display: 'inline-block',
                          border: '1px solid var(--color-border)'
                        }} 
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{col.name}</td>
                    <td className="text-mono text-muted">{col.hex}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEditClick(col)}
                          className={styles.moreBtn}
                          style={{ padding: '6px', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(col)}
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
            <span className={styles.formPanelTitle}>{editId ? 'Edit Color' : 'Create New Color'}</span>
            {editId && (
              <button onClick={handleCancelEdit} style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <form onSubmit={handleSave} className={styles.formPanelBody}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Color Name</label>
              <input
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                required
                placeholder="e.g. Royal Blue"
                className={styles.formInput}
              />
              <span className={styles.formHelp}>The user-facing title of the color.</span>
            </div>

            {/* Inline Ergonomic Color Picker */}
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Color Selection & Hex Code *</label>
              
              <div style={{
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {/* Top Row: Large Live Swatch + Hex Input */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    backgroundColor: inputHex.startsWith('#') ? inputHex : '#8c5b45',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      type="text"
                      value={inputHex}
                      onChange={e => setInputHex(e.target.value)}
                      required
                      placeholder="#8c5b45"
                      className={styles.formInput}
                      style={{ margin: 0, width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* Hue Spectrum Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    <span>Hue Spectrum</span>
                    <span>{hsl.h}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={e => updateHsl(parseInt(e.target.value), hsl.s, hsl.l)}
                    style={{
                      width: '100%',
                      height: '14px',
                      borderRadius: '7px',
                      appearance: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                      margin: 0
                    }}
                  />
                </div>

                {/* Saturation Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    <span>Vibrancy (Saturation)</span>
                    <span>{hsl.s}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={e => updateHsl(hsl.h, parseInt(e.target.value), hsl.l)}
                    style={{
                      width: '100%',
                      height: '10px',
                      borderRadius: '5px',
                      appearance: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`,
                      margin: 0
                    }}
                  />
                </div>

                {/* Shade / Lightness Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    <span>Shade (Lightness)</span>
                    <span>{hsl.l}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={hsl.l}
                    onChange={e => updateHsl(hsl.h, hsl.s, parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '10px',
                      borderRadius: '5px',
                      appearance: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      background: `linear-gradient(to right, #000000, ${hslToHex(hsl.h, hsl.s, 50)}, #ffffff)`,
                      margin: 0
                    }}
                  />
                </div>

              </div>
              <span className={styles.formHelp}>Slide Hue, Vibrancy, and Shade to pick any color inline, or enter hex code directly.</span>
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
                <span>{saving ? 'Saving...' : editId ? 'Update' : 'Create Color'}</span>
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
                Confirm Color Deletion
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
                <strong>WARNING:</strong> Are you sure you want to delete color snippet <strong>"{deleteTarget.name}"</strong> ({deleteTarget.hex})? This action cannot be undone.
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
export default ColorsSnippetPage;
