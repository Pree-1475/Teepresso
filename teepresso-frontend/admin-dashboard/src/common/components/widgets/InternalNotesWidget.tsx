import React, { useState, useEffect } from 'react';
import { StickyNote, X, Edit2, Check, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '@/common/config/api';

export function InternalNotesWidget({ userRole }: { userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (data.success && data.settings?.internal_notes) {
        setNotes(data.settings.internal_notes);
      }
    } catch (err) {
      console.error('Failed to fetch internal notes:', err);
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'internal_notes', value: notes })
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {isOpen && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          width: '320px',
          marginBottom: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 600 }}>
              <StickyNote size={16} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>Internal Notice Board</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b45309', padding: '4px' }}>
              <X size={16} />
            </button>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#fffbeb', flex: 1, minHeight: '150px' }}>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', height: '100%', minHeight: '120px', padding: '8px', border: '1px solid #fcd34d', borderRadius: '4px', resize: 'vertical', backgroundColor: '#fff', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                placeholder="Enter internal notes, announcements, or urgent updates here..."
                autoFocus
              />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', color: '#451a03', fontSize: '14px', lineHeight: 1.5 }}>
                {notes || <span style={{ color: '#d97706', fontStyle: 'italic' }}>No active notes.</span>}
              </div>
            )}
          </div>
          
          {isAdmin && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #fde68a', backgroundColor: '#fef3c7', display: 'flex', justifyContent: 'flex-end' }}>
              {isEditing ? (
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#b45309', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                >
                  <Check size={14} />
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', color: '#b45309', border: '1px solid #b45309', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                >
                  <Edit2 size={14} />
                  Edit Notes
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#f59e0b',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
          position: 'relative'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={24} /> : <StickyNote size={24} />}
        {!isOpen && notes.trim() && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '12px',
            height: '12px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid #fff'
          }} />
        )}
      </button>
    </div>
  );
}
