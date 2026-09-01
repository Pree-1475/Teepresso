import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Upload, X, Check } from 'lucide-react';
import styles from './ProductsAdminPage.module.css';
import { API_BASE_URL } from '@/common/config/api';


interface PriceTier {
  minQty: number;
  price: number;
}

interface Category {
  id: string;
  name: string;
}

interface ColorSnippet {
  id: string;
  name: string;
  hex: string;
}

interface SizeSnippet {
  id: string;
  name: string;
  category: 'Kids Sizes' | 'Adult Standard' | 'Adult Plus (Special)';
}

interface PatternSnippet {
  id: string;
  name: string;
  image: string;
  category?: string;
}

export function AddEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    shortDesc: '',
    image: '',
    popularFor: '',
    requiresSizes: true,
    requiresColors: true,
    requiresPatterns: false,
    requiresMockup: true,
    applyVolumeDiscount: true,
    isSeasonalKurta: false,
  });

  const [tiers, setTiers] = useState<PriceTier[]>([
    { minQty: 1, price: 199 }
  ]);

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);

  // Stock state variables
  const [stock, setStock] = useState<number>(0);
  const [sizesStock, setSizesStock] = useState<Record<string, number>>({});

  // Snippets Lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableColors, setAvailableColors] = useState<ColorSnippet[]>([]);
  const [availableSizes, setAvailableSizes] = useState<SizeSnippet[]>([]);
  const [availablePatterns, setAvailablePatterns] = useState<PatternSnippet[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ sizes?: string; colors?: string }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // New Tier inputs
  const [newMinQty, setNewMinQty] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Load configuration snippets and product data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch Categories Snippet list
        const catRes = await fetch(`${API_BASE_URL}/categories`);
        const catData = await catRes.json();
        let loadedCats: Category[] = [];
        if (catData.success && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
          loadedCats = catData.categories;
        }

        // 2. Fetch Colors Snippet list
        const colRes = await fetch(`${API_BASE_URL}/colors`);
        const colData = await colRes.json();
        if (colData.success && Array.isArray(colData.colors)) {
          setAvailableColors(colData.colors);
        }

        // 3. Fetch Sizes Snippet list
        const sizeRes = await fetch(`${API_BASE_URL}/sizes`);
        const sizeData = await sizeRes.json();
        if (sizeData.success && Array.isArray(sizeData.sizes)) {
          setAvailableSizes(sizeData.sizes);
        }

        // 4. Fetch Patterns Snippet list
        try {
          const patRes = await fetch(`${API_BASE_URL}/patterns`);
          const patData = await patRes.json();
          if (patData.success && Array.isArray(patData.patterns)) {
            setAvailablePatterns(patData.patterns);
          }
        } catch (e) {
          console.error('Failed to load patterns snippets:', e);
        }

        // 5. Fetch Product details (if edit mode)
        if (isEditMode && id) {
          const prodRes = await fetch(`${API_BASE_URL}/products/${id}`);
          const prodData = await prodRes.json();
          if (prodData.success && prodData.product) {
            const prod = prodData.product;
            setFormData({
              id: prod.id,
              name: prod.name,
              category: prod.category || (loadedCats.length > 0 ? loadedCats[0].name : ''),
              shortDesc: prod.shortDesc || '',
              image: prod.image || '',
              popularFor: prod.popularFor || '',
              requiresSizes: prod.requiresSizes !== false,
              requiresColors: prod.requiresColors !== false,
              requiresPatterns: !!prod.requiresPatterns,
              requiresMockup: prod.requiresMockup !== false,
              applyVolumeDiscount: prod.applyVolumeDiscount !== false,
              isSeasonalKurta: !!prod.isSeasonalKurta,
            });
            if (prod.tiers && prod.tiers.length > 0) {
              setTiers(prod.tiers);
            }
            if (Array.isArray(prod.colors)) {
              setSelectedColors(prod.colors);
            }
            if (Array.isArray(prod.sizes)) {
              setSelectedSizes(prod.sizes);
            }
            if (Array.isArray(prod.patterns)) {
              setSelectedPatterns(prod.patterns);
            }
            if (Array.isArray(prod.gallery)) {
              setGallery(prod.gallery);
            }
            // Populate stock levels
            setStock(prod.stock !== undefined ? prod.stock : 0);
            setSizesStock(prod.sizesStock || {});
          } else {
            setError(prodData.message || 'Failed to load product');
          }
        } else {
          // Default category choice
          if (loadedCats.length > 0) {
            setFormData(prev => ({ ...prev, category: loadedCats[0].name }));
          }
          // Default pre-fill all sizes for new products
          if (sizeData.success && Array.isArray(sizeData.sizes)) {
            setSelectedSizes(sizeData.sizes.map((s: SizeSnippet) => s.name));
            // Default 100 blank stock for each size
            const initialSizesStock: Record<string, number> = {};
            sizeData.sizes.forEach((s: SizeSnippet) => {
              initialSizesStock[s.name] = 100;
            });
            setSizesStock(initialSizesStock);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Network error: failed to fetch configuration snippets.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isEditMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Primary image upload handler (Wagtail File Upload style)
  const handlePrimaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearPrimaryImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Secondary Gallery images upload handler
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== index));
  };

  // Pricing tier handlers
  const handleAddTier = () => {
    const min = Number(newMinQty);
    const pr = Number(newPrice);
    if (!min || !pr || min < 1 || pr < 0) {
      alert('Please enter valid positive numbers for quantity and price');
      return;
    }

    // Check duplicate quantity
    if (tiers.some(t => t.minQty === min)) {
      alert(`A pricing tier for ${min}+ pieces already exists.`);
      return;
    }

    const updatedTiers = [...tiers, { minQty: min, price: pr }].sort((a, b) => a.minQty - b.minQty);
    setTiers(updatedTiers);
    setNewMinQty('');
    setNewPrice('');
  };

  const handleRemoveTier = (minQtyToRemove: number) => {
    if (tiers.length === 1) {
      alert('You must have at least one pricing tier.');
      return;
    }
    setTiers(prev => prev.filter(t => t.minQty !== minQtyToRemove));
  };

  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTiers(prev => {
      const rest = prev.filter(t => t.minQty !== 1);
      return [{ minQty: 1, price: val }, ...rest].sort((a, b) => a.minQty - b.minQty);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    const errors: { sizes?: string; colors?: string } = {};
    if (formData.requiresSizes && selectedSizes.length === 0) {
      errors.sizes = 'You must select at least one size variant from the list.';
    }
    if (formData.requiresColors && selectedColors.length === 0) {
      errors.colors = 'You must select at least one color variant from the list.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    } else {
      setFieldErrors({});
    }

    setLoading(true);

    // Filter sizesStock to include 3D combinations: color, pattern, size
    const filteredSizesStock: Record<string, number> = {};
    if (formData.requiresColors && formData.requiresPatterns && formData.requiresSizes) {
      selectedColors.forEach(color => {
        selectedPatterns.forEach(pattern => {
          selectedSizes.forEach(sz => {
            const key = `${color}_${pattern}_${sz}`;
            filteredSizesStock[key] = sizesStock[key] !== undefined ? Number(sizesStock[key]) : 100;
          });
        });
      });
    } else if (formData.requiresColors && formData.requiresPatterns) {
      selectedColors.forEach(color => {
        selectedPatterns.forEach(pattern => {
          const key = `${color}_${pattern}`;
          filteredSizesStock[key] = sizesStock[key] !== undefined ? Number(sizesStock[key]) : 100;
        });
      });
    } else if (formData.requiresPatterns && formData.requiresSizes) {
      selectedPatterns.forEach(pattern => {
        selectedSizes.forEach(sz => {
          const key = `${pattern}_${sz}`;
          filteredSizesStock[key] = sizesStock[key] !== undefined ? Number(sizesStock[key]) : 100;
        });
      });
    } else if (formData.requiresColors && formData.requiresSizes) {
      selectedColors.forEach(color => {
        selectedSizes.forEach(sz => {
          const key = `${color}_${sz}`;
          filteredSizesStock[key] = sizesStock[key] !== undefined ? Number(sizesStock[key]) : 100;
        });
      });
    } else if (formData.requiresSizes) {
      selectedSizes.forEach(sz => {
        filteredSizesStock[sz] = sizesStock[sz] !== undefined ? Number(sizesStock[sz]) : 100;
      });
    } else if (formData.requiresColors) {
      selectedColors.forEach(color => {
        filteredSizesStock[color] = sizesStock[color] !== undefined ? Number(sizesStock[color]) : 100;
      });
    } else if (formData.requiresPatterns) {
      selectedPatterns.forEach(pattern => {
        filteredSizesStock[pattern] = sizesStock[pattern] !== undefined ? Number(sizesStock[pattern]) : 100;
      });
    }

    const productPayload = {
      id: isEditMode ? formData.id : formData.id.trim() || undefined,
      name: formData.name.trim(),
      category: formData.category,
      shortDesc: formData.shortDesc.trim(),
      colors: selectedColors,
      sizes: selectedSizes,
      patterns: selectedPatterns,
      image: formData.image.trim(),
      gallery: gallery,
      popularFor: formData.popularFor.trim(),
      requiresSizes: formData.requiresSizes,
      requiresColors: formData.requiresColors,
      requiresPatterns: formData.requiresPatterns,
      requiresMockup: formData.requiresMockup,
      applyVolumeDiscount: formData.applyVolumeDiscount,
      isSeasonalKurta: formData.isSeasonalKurta,
      startingPrice: tiers[0]?.price || 199,
      tiers: tiers,
      stock: (!formData.requiresSizes && !formData.requiresColors && !formData.requiresPatterns) ? Number(stock) : undefined,
      sizesStock: (formData.requiresSizes || formData.requiresColors || formData.requiresPatterns) ? filteredSizesStock : undefined
    };

    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/products/${id}` 
        : `${API_BASE_URL}/products`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });
      const data = await res.json();

      if (data.success) {
        navigate('/products');
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
      setError('Network error: failed to communicate with server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        navigate('/products');
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Group sizes helper
  const renderSizeGroupSelector = (groupName: 'Kids Sizes' | 'Adult Standard' | 'Adult Plus (Special)') => {
    const groupSizes = availableSizes.filter(s => s.category === groupName);
    if (groupSizes.length === 0) return null;

    return (
      <div style={{ marginTop: '12px' }}>
        <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px', borderBottom: '1px dashed var(--color-border)', paddingBottom: '4px' }}>
          {groupName}
        </h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {groupSizes.map(size => {
            const isChecked = selectedSizes.includes(size.name);
            return (
              <button
                type="button"
                key={size.id}
                onClick={() => {
                  if (isChecked) {
                    setSelectedSizes(prev => prev.filter(s => s !== size.name));
                  } else {
                    setSelectedSizes(prev => [...prev, size.name]);
                    // Set default stock of 100 for newly selected sizes
                    if (sizesStock[size.name] === undefined) {
                      setSizesStock(prev => ({ ...prev, [size.name]: 100 }));
                    }
                  }
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isChecked ? 'rgba(5, 122, 120, 0.08)' : 'var(--color-surface-white)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: isChecked ? 'var(--color-primary)' : 'var(--color-text-title)'
                }}
              >
                {size.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && !formData.name && categories.length === 0) {
    return <div className={styles.workspace}><p className="text-muted">Loading configuration form...</p></div>;
  }

  return (
    <div className={styles.workspace} style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Breadcrumbs Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/products" className={styles.backLink} style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', fontSize: '13px', textDecoration: 'none', color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={14} />
          <span>Back to Product Catalog</span>
        </Link>
      </div>

      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className={styles.title}>{isEditMode ? `Editing: ${formData.name}` : 'Add New Product'}</h1>
          <p className={styles.subtitle}>Configure custom options, volume prices, and presentation assets</p>
        </div>
        {isEditMode && (
          <button 
            type="button" 
            onClick={() => setShowDeleteModal(true)}
            style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--color-status-danger)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
            <span>Delete Product</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Basic Info panel */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader}>
            <span className={styles.formPanelTitle}>Basic Information</span>
          </div>
          <div className={styles.formPanelBody}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Classic Round Neck T-Shirt"
                className={styles.formInput}
              />
              <span className={styles.formHelp}>The main commercial title of the product shown to customers.</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                >
                  <option value="">-- Choose Category Snippet --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <span className={styles.formHelp}>Dynamically loaded from your category snippets list.</span>
              </div>

              {!isEditMode && (
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Custom URL ID (Slug)</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="e.g. classic-roundneck-tee"
                    className={styles.formInput}
                  />
                  <span className={styles.formHelp}>Optional custom identifier for URLs. Left blank, it auto-generates.</span>
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel}>Short Summary / Description</label>
              <textarea
                name="shortDesc"
                value={formData.shortDesc}
                onChange={handleChange}
                rows={3}
                placeholder="Describe fabric weight, raw materials, or customization suitability..."
                className={styles.formInput}
                style={{ fontFamily: 'inherit', resize: 'vertical' }}
              />
              <span className={styles.formHelp}>A brief summary shown on listing cards and search highlights.</span>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel}>Popular Use Case Highlight</label>
              <input
                type="text"
                name="popularFor"
                value={formData.popularFor}
                onChange={handleChange}
                placeholder="e.g. College Fests, Sports Tournaments"
                className={styles.formInput}
              />
              <span className={styles.formHelp}>Small text badge highlighting the ideal target group for this product.</span>
            </div>
          </div>
        </div>

        {/* Visual Presentation panel */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader}>
            <span className={styles.formPanelTitle}>Images</span>
          </div>
          <div className={styles.formPanelBody}>
            
            {/* Primary Display Image (Wagtail Chooser block) */}
            <div className={styles.formRow} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '32px', marginBottom: '24px' }}>
              <label className={styles.formLabel}>Primary Display Image (Wagtail Chooser)</label>
              
              {formData.image ? (
                <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden', backgroundColor: 'var(--color-surface-beige)', marginTop: '8px' }}>
                  <img src={formData.image} alt="Primary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={handleClearPrimaryImage}
                    style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Remove primary image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '160px', borderRadius: '8px', border: '2px dashed var(--color-border)', cursor: 'pointer', marginTop: '8px', transition: 'border-color 0.15s ease' }} className="image-drop-area">
                  <Upload size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-title)' }}>Upload Primary Display Image</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Supported formats: PNG, JPG, JPEG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {/* Gallery Images Grid Section */}
            <div className={styles.formRow}>
              <label className={styles.formLabel}>More Images / Product Gallery</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', marginTop: '12px' }}>
                
                {/* Current Gallery items */}
                {gallery.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '6px', border: '1px solid var(--color-border)', overflow: 'hidden', backgroundColor: 'var(--color-surface-beige)' }}>
                    <img src={img} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryItem(idx)}
                      style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Add new Gallery item box */}
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', aspectRatio: '1', borderRadius: '6px', border: '2px dashed var(--color-border)', cursor: 'pointer', transition: 'border-color 0.15s ease' }} className="image-drop-area">
                  <Plus size={20} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '4px' }}>Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <span className={styles.formHelp}>Upload secondary thumbnail views, alternate color layouts, or close-up fabric details.</span>
            </div>
          </div>
        </div>

        {/* Pricing Details panel */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader}>
            <span className={styles.formPanelTitle}>Pricing & Volume Discount Brackets</span>
          </div>
          <div className={styles.formPanelBody}>
            
            {!formData.applyVolumeDiscount ? (
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Base Unit Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 199"
                  value={tiers.find(t => t.minQty === 1)?.price || ''}
                  onChange={handleBasePriceChange}
                  className={styles.formInput}
                  required
                />
                <span className={styles.formHelp}>Flat rate price per piece for this product (bulk volume discount is currently disabled).</span>
              </div>
            ) : (
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Active Pricing Tiers (Volume Brackets)</label>
                
                <div className="erp-table-container" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  <table className="erp-table" style={{ cursor: 'default' }}>
                    <thead>
                      <tr>
                        <th>Min Quantity (pcs)</th>
                        <th>Unit Rate (₹)</th>
                        <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((t, idx) => (
                        <tr key={idx} style={{ background: 'transparent' }}>
                          <td><strong>{t.minQty}+ pcs</strong></td>
                          <td><strong>₹{t.price}</strong> <span className="text-muted" style={{ fontSize: '11px' }}>/ pc</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTier(t.minQty)}
                              className={styles.moreBtn}
                              style={{ color: 'var(--color-status-danger)', padding: '4px', cursor: 'pointer', display: 'inline-flex' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Pricing Tier Form */}
                <div className={styles.formGrid} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Min Quantity Bracket</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={newMinQty}
                      onChange={e => setNewMinQty(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Price Per Piece (₹)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        placeholder="e.g. 149"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        className={styles.formInput}
                      />
                      <button
                        type="button"
                        onClick={handleAddTier}
                        className="erp-btn-primary"
                        style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        <Plus size={12} />
                        <span>Add Tier</span>
                      </button>
                    </div>
                  </div>
                </div>
                <span className={styles.formHelp}>Define quantity price brackets. Starting price and range display will auto-calculate based on these values.</span>
              </div>
            )}

            {/* applyVolumeDiscount toggle at the bottom of the Pricing panel */}
            <div style={{ marginTop: '20px', borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
              <label className={styles.formCheckboxLabel} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="applyVolumeDiscount"
                  checked={formData.applyVolumeDiscount}
                  onChange={handleChange}
                  className={styles.formCheckboxInput}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-title)' }}>Eligible for bulk volume discount</span>
              </label>
            </div>

          </div>
        </div>

        {/* Configurations panel */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader}>
            <span className={styles.formPanelTitle}>Configurations</span>
          </div>
          <div className={styles.formPanelBody}>
            <div className={styles.formCheckboxGroup} style={{ marginBottom: '24px' }}>
              <label className={styles.formCheckboxLabel}>
                <input
                  type="checkbox"
                  name="requiresSizes"
                  checked={formData.requiresSizes}
                  onChange={handleChange}
                  className={styles.formCheckboxInput}
                />
                <span>Requires size grids</span>
              </label>

              <label className={styles.formCheckboxLabel}>
                <input
                  type="checkbox"
                  name="requiresColors"
                  checked={formData.requiresColors}
                  onChange={handleChange}
                  className={styles.formCheckboxInput}
                />
                <span>Requires color options</span>
              </label>

              <label className={styles.formCheckboxLabel}>
                <input
                  type="checkbox"
                  name="requiresPatterns"
                  checked={formData.requiresPatterns}
                  onChange={handleChange}
                  className={styles.formCheckboxInput}
                />
                <span>Requires pattern / print options</span>
              </label>

              <label className={styles.formCheckboxLabel}>
                <input
                  type="checkbox"
                  name="requiresMockup"
                  checked={formData.requiresMockup}
                  onChange={handleChange}
                  className={styles.formCheckboxInput}
                />
                <span>Enables mockup customizer</span>
              </label>

              <label className={styles.formCheckboxLabel}>
                <input
                  type="checkbox"
                  name="isSeasonalKurta"
                  checked={formData.isSeasonalKurta}
                  onChange={handleChange}
                  className={styles.formCheckboxInput}
                />
                <span>Mark as seasonal item</span>
              </label>
            </div>

            {/* Colors Snippet Selection */}
            {formData.requiresColors && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginBottom: '20px' }}>
                <label className={styles.formLabel}>Select Available Colors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                  {availableColors.map(color => {
                    const isChecked = selectedColors.includes(color.hex);
                    return (
                      <button
                        type="button"
                        key={color.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedColors(prev => prev.filter(c => c !== color.hex));
                          } else {
                            setSelectedColors(prev => [...prev, color.hex]);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '24px',
                          border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: isChecked ? 'rgba(5, 122, 120, 0.08)' : 'var(--color-surface-white)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isChecked ? 'var(--color-primary)' : 'var(--color-text-muted)'
                        }}
                      >
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: color.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                        <span>{color.name}</span>
                        {isChecked && <Check size={12} style={{ marginLeft: '2px' }} />}
                      </button>
                    );
                  })}
                </div>
                <span className={styles.formHelp}>Select one or more color variants from the color snippets collection.</span>
                {fieldErrors.colors && (
                  <div style={{ color: 'var(--color-status-danger)', fontSize: '12px', fontWeight: 'bold', marginTop: '8px' }}>
                    ⚠️ {fieldErrors.colors}
                  </div>
                )}
              </div>
            )}

            {/* Pattern Snippet Selection */}
            {formData.requiresPatterns && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginBottom: '20px' }}>
                <label className={styles.formLabel}>Select Available Patterns / Prints for this Product</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                  {availablePatterns.map(pattern => {
                    const isChecked = selectedPatterns.includes(pattern.name);
                    return (
                      <button
                        type="button"
                        key={pattern.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedPatterns(prev => prev.filter(p => p !== pattern.name));
                          } else {
                            setSelectedPatterns(prev => [...prev, pattern.name]);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '24px',
                          border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: isChecked ? 'rgba(5, 122, 120, 0.08)' : 'var(--color-surface-white)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isChecked ? 'var(--color-primary)' : 'var(--color-text-muted)'
                        }}
                      >
                        {pattern.image && (
                          <img src={pattern.image} alt={pattern.name} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <span>{pattern.name}</span>
                        {isChecked && <Check size={12} style={{ marginLeft: '2px' }} />}
                      </button>
                    );
                  })}
                </div>
                <span className={styles.formHelp}>Select one or more pattern snippets enabled for customization on this product.</span>
              </div>
            )}

            {/* Sizing Snippet Selection (Grouped by Category) */}
            {formData.requiresSizes && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', paddingBottom: '10px' }}>
                <label className={styles.formLabel}>Select Available Sizes for this Product</label>
                
                {renderSizeGroupSelector('Kids Sizes')}
                {renderSizeGroupSelector('Adult Standard')}
                {renderSizeGroupSelector('Adult Plus (Special)')}

                <span className={styles.formHelp} style={{ display: 'block', marginTop: '12px' }}>Toggle to select sizes enabled for customization and ordering.</span>
                
                {fieldErrors.sizes && (
                  <div style={{ color: 'var(--color-status-danger)', fontSize: '12px', fontWeight: 'bold', marginTop: '8px' }}>
                    ⚠️ {fieldErrors.sizes}
                  </div>
                )}
              </div>
            )}

            {/* Ergonomic Stock Management Section */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '20px' }}>
              <label className={styles.formLabel}>Inventory Stock Management</label>
              
              {!formData.requiresSizes && !formData.requiresColors ? (
                // 1. Flat Stock Level Editor (No colors, no sizes)
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={stock}
                      onChange={e => setStock(Math.max(0, Number(e.target.value)))}
                      className={styles.formInput}
                      style={{ maxWidth: '140px' }}
                    />
                    <span className="text-muted" style={{ fontSize: '13px' }}>Pcs Available</span>
                  </div>
                  <span className={styles.formHelp}>Enter overall available stock count for this single-sized accessory item.</span>
                </div>
              ) : !formData.requiresSizes && formData.requiresColors ? (
                // 2. Color-only Stock Level Editor (No sizes)
                <div style={{ marginTop: '8px' }}>
                  {selectedColors.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-status-warning)', fontWeight: 600 }}>
                      ⚠️ Please select available colors above to configure color-specific stock levels.
                    </p>
                  ) : (
                    <div>
                      <span className={styles.formHelp} style={{ marginBottom: '12px', display: 'block' }}>Enter the stock count for each color variant:</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                        {selectedColors.map(color => {
                          const colName = availableColors.find(c => c.hex === color)?.name || 'Color';
                          return (
                            <div 
                              key={color} 
                              style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '6px', 
                                backgroundColor: 'var(--color-surface-hover)', 
                                padding: '10px 14px', 
                                borderRadius: '4px', 
                                border: '1px solid var(--color-border)' 
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, border: '1px solid rgba(0,0,0,0.1)' }} />
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>{colName}</span>
                              </div>
                              <input
                                type="number"
                                placeholder="0"
                                value={sizesStock[color] !== undefined ? sizesStock[color] : 100}
                                onChange={e => {
                                  const val = Math.max(0, Number(e.target.value));
                                  setSizesStock(prev => ({ ...prev, [color]: val }));
                                }}
                                className={styles.formInput}
                                style={{ padding: '4px 6px', fontSize: '12px', width: '100%', margin: 0 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : formData.requiresColors && formData.requiresPatterns && formData.requiresSizes ? (
                // 3-WAY RELATION STOCK MATRIX EDITOR: Color + Pattern + Size
                <div style={{ marginTop: '8px' }}>
                  {selectedSizes.length === 0 || selectedColors.length === 0 || selectedPatterns.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-status-warning)', fontWeight: 600 }}>
                      ⚠️ Please select colors, patterns, and sizes above to configure 3-way variant stock levels.
                    </p>
                  ) : (
                    <div>
                      <span className={styles.formHelp} style={{ marginBottom: '16px', display: 'block' }}>Enter stock counts for each 3-Way (Color + Pattern + Size) variant:</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {selectedColors.map(color => {
                          const colName = availableColors.find(c => c.hex === color)?.name || 'Color';
                          return (
                            <div key={color} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, border: '1px solid rgba(0,0,0,0.15)' }} />
                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-title)' }}>{colName} 3-Way Matrix</span>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedPatterns.map(pattern => (
                                  <div key={pattern} style={{ backgroundColor: 'var(--color-surface-hover)', padding: '12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-light)', display: 'block', marginBottom: '8px' }}>
                                      Pattern: {pattern}
                                    </span>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                                      {selectedSizes.map(sz => {
                                        const key = `${color}_${pattern}_${sz}`;
                                        return (
                                          <div key={sz} style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-title)' }}>Size {sz}</span>
                                            <input
                                              type="number"
                                              placeholder="0"
                                              value={sizesStock[key] !== undefined ? sizesStock[key] : 100}
                                              onChange={e => {
                                                const val = Math.max(0, Number(e.target.value));
                                                setSizesStock(prev => ({ ...prev, [key]: val }));
                                              }}
                                              className={styles.formInput}
                                              style={{ padding: '4px 6px', fontSize: '12px', width: '100%', margin: 0 }}
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : formData.requiresColors ? (
                // Color + Size variant Stock Level Editor (Both enabled)
                <div style={{ marginTop: '8px' }}>
                  {selectedSizes.length === 0 || selectedColors.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-status-warning)', fontWeight: 600 }}>
                      ⚠️ Please select both colors and sizes above to configure variant stock levels.
                    </p>
                  ) : (
                    <div>
                      <span className={styles.formHelp} style={{ marginBottom: '16px', display: 'block' }}>Enter stock counts for each active Color + Size combination:</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {selectedColors.map(color => {
                          const colName = availableColors.find(c => c.hex === color)?.name || 'Color';
                          return (
                            <div key={color} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, border: '1px solid rgba(0,0,0,0.15)' }} />
                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-title)' }}>{colName} Stock</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                                {selectedSizes.map(sz => {
                                  const key = `${color}_${sz}`;
                                  return (
                                    <div 
                                      key={sz} 
                                      style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '6px', 
                                        backgroundColor: 'var(--color-surface-hover)', 
                                        padding: '10px 14px', 
                                        borderRadius: '4px', 
                                        border: '1px solid var(--color-border)' 
                                      }}
                                    >
                                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
                                        Size {sz}
                                      </span>
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={sizesStock[key] !== undefined ? sizesStock[key] : 100}
                                        onChange={e => {
                                          const val = Math.max(0, Number(e.target.value));
                                          setSizesStock(prev => ({ ...prev, [key]: val }));
                                        }}
                                        className={styles.formInput}
                                        style={{ padding: '4px 6px', fontSize: '12px', width: '100%', margin: 0 }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // 4. Size-only Stock Level Grid (No Colors)
                <div style={{ marginTop: '8px' }}>
                  {selectedSizes.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-status-warning)', fontWeight: 600 }}>
                      ⚠️ Please select available sizes above to configure size-specific stock levels.
                    </p>
                  ) : (
                    <div>
                      <span className={styles.formHelp} style={{ marginBottom: '12px', display: 'block' }}>Enter the count of blank garments currently in stock for each active size:</span>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                        {selectedSizes.map(sz => (
                          <div 
                            key={sz} 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '6px', 
                              backgroundColor: 'var(--color-surface-hover)', 
                              padding: '10px 14px', 
                              borderRadius: '4px', 
                              border: '1px solid var(--color-border)' 
                            }}
                          >
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
                              Size {sz}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                placeholder="0"
                                value={sizesStock[sz] !== undefined ? sizesStock[sz] : 100}
                                onChange={e => {
                                  const val = Math.max(0, Number(e.target.value));
                                  setSizesStock(prev => ({ ...prev, [sz]: val }));
                                }}
                                className={styles.formInput}
                                style={{ padding: '4px 6px', fontSize: '12px', width: '100%', margin: 0 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Floating Validation Error Banner */}
        {Object.keys(fieldErrors).length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '86px',
            right: '32px',
            width: '280px',
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-primary)',
            color: 'var(--color-text-title)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validation Alert</span>
              <button 
                type="button" 
                onClick={() => setFieldErrors({})}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              >
                <X size={14} />
              </button>
            </div>
            <div style={{ color: 'var(--color-text-body)' }}>
              Required configuration options are missing. Please review and fill in the highlighted size or color selections.
            </div>
          </div>
        )}

        {/* Sticky Actions Footer */}
        <div className={styles.stickyFooter} style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
          <Link to="/products" className="erp-btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="erp-btn-primary"
            style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 24px', cursor: 'pointer' }}
          >
            <Save size={14} />
            <span>{loading ? 'Saving Changes...' : 'Save Product'}</span>
          </button>
        </div>

      </form>

      {/* CUSTOM DELETE CONFIRMATION MODAL OVERLAY */}
      {showDeleteModal && (
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
                Confirm Product Deletion
              </h3>
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)}
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
                borderRadius: '2px',
                color: 'var(--color-status-danger)',
                fontSize: '12px',
                lineHeight: '1.5',
                marginBottom: '20px'
              }}>
                <strong>WARNING:</strong> You are about to permanently delete <strong>{formData.name}</strong>. This will remove the item from the catalog, and it cannot be undone.
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-body)', lineHeight: '1.4' }}>
                Are you sure you want to proceed with deleting this product?
              </p>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                className="erp-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{ 
                  padding: '8px 24px', 
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-status-danger)',
                  borderColor: 'var(--color-status-danger)',
                  color: '#fff',
                  border: '1px solid var(--color-status-danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AddEditProductPage;
