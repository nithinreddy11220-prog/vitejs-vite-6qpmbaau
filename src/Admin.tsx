import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from './supabase';
import './Admin.css';

type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  sizes: { label: string; price: number }[] | null;
  tag: string | null;
  section: string | null;
  image_url: string | null;
  available: boolean;
};

const emptyForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  tag: '',
  section: '',
  image_url: '',
};

const IMAGE_BUCKET = 'product-images';

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const productGroups = products.reduce<Record<string, Product[]>>((groups, product) => {
    let groupName = product.category;

    if (product.category === 'Cakes') {
      groupName = 'Cakes';
    } else if (
      product.category === 'Fast Food' ||
      product.category === 'Pizza & Momos' ||
      product.category === 'Beverages'
    ) {
      groupName = product.section?.trim() || product.category;
    } else if (product.category === 'Desserts') {
      groupName = 'Desserts';
    } else {
      groupName = product.section?.trim() || product.category;
    }

    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(product);
    return groups;
  }, {});

  const groupIcons: Record<string, string> = {
    Cakes: '🎂',
    Burgers: '🍔',
    Pasta: '🍝',
    'Garlic Bread': '🥖',
    Sandwiches: '🥪',
    Rolls: '🌯',
    Snacks: '🍟',
    Momos: '🥟',
    'Pizza Add-ons': '🍕',
    'Cold Coffee': '🧋',
    Coffee: '☕',
    Mocktails: '🍹',
    Milkshakes: '🥤',
    Desserts: '🍰',
  };

  function toggleGroup(groupName: string) {
    setExpandedGroups((current) =>
      current.includes(groupName)
        ? current.filter((name) => name !== groupName)
        : [...current, groupName]
    );
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadProducts();
    } else {
      setProducts([]);
    }
  }, [session]);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage(error.message);
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMessage('');
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Please choose an image smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    setMessage('');

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setMessage(`Image upload failed: ${uploadError.message}`);
      setUploadingImage(false);
      event.target.value = '';
      return;
    }

    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(filePath);

    setForm((current) => ({ ...current, image_url: data.publicUrl }));
    setMessage('Image uploaded. Save the product to publish it.');
    setUploadingImage(false);
    event.target.value = '';
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const productData = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim() || null,
      price: form.price ? Number(form.price) : null,
      tag: form.tag.trim() || null,
      section: form.section.trim() || null,
      image_url: form.image_url.trim() || null,
    };

    if (!productData.name || !productData.category) {
      setMessage('Please enter a product name and category.');
      setSaving(false);
      return;
    }

    const result = editingId
      ? await supabase.from('products').update(productData).eq('id', editingId)
      : await supabase.from('products').insert(productData);

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(editingId ? 'Product updated!' : 'Product added!');
      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    }

    setSaving(false);
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description || '',
      price: product.price?.toString() || '',
      tag: product.tag || '',
      section: product.section || '',
      image_url: product.image_url || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
  }

  async function toggleAvailability(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({ available: !product.available })
      .eq('id', product.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(`${product.name} is now ${product.available ? 'unavailable' : 'available'}.`);
      await loadProducts();
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Product deleted.');
      if (editingId === product.id) cancelEdit();
      await loadProducts();
    }
  }

  if (loading && !session) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!session) {
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <div className="admin-logo">CHEF CAKES</div>
          <p className="admin-subtitle">ADMINISTRATION PANEL</p>
          <h1>Welcome Back</h1>
          <p>Sign in to manage your bakery.</p>

          <label>Email Address</label>
          <input name="email" type="email" placeholder="Admin email" required />

          <label>Password</label>
          <input name="password" type="password" placeholder="Enter password" required />

          <button type="submit" disabled={saving}>
            {saving ? 'Signing in...' : 'Sign In'}
          </button>

          {message && <p className="admin-message">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <div className="admin-logo">CHEF CAKES</div>
          <p>ADMIN DASHBOARD</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <section className="admin-content">
        <div className="admin-welcome">
          <div>
            <p>MANAGEMENT PANEL</p>
            <h1>Manage Your Menu</h1>
            <span>Add, edit, photograph and manage every menu item.</span>
          </div>
          <div className="product-count">
            <strong>{products.length}</strong>
            <span>Total Products</span>
          </div>
        </div>

        <form className="product-form" onSubmit={handleSave}>
          <h2>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>

          <div className="admin-form-grid">
            <div>
              <label>Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Classic Veg Burger"
                required
              />
            </div>

            <div>
              <label>Category *</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Fast Food"
                required
              />
            </div>

            <div>
              <label>Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="140"
              />
            </div>

            <div>
              <label>Tag</label>
              <input
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="Bestseller"
              />
            </div>

            <div>
              <label>Section</label>
              <input
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="Burgers"
              />
            </div>

            <div>
              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this menu item"
              />
            </div>

            <div className="admin-image-field">
              <label>Upload Product Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage || saving}
              />
              <small>Choose a JPG, PNG or WebP image. Maximum size: 5 MB.</small>

              <label>Or paste an online photo URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://example.com/product-photo.jpg"
              />

              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Product preview"
                  className="admin-image-preview"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                />
              )}
              {uploadingImage && <small>Uploading image...</small>}
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving || uploadingImage}>
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" className="cancel-button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>

          {message && <p className="admin-message">{message}</p>}
        </form>

        <section className="products-section">
          <div className="products-heading">
            <h2>Your Menu Items</h2>
            <button type="button" onClick={loadProducts}>Refresh</button>
          </div>

          {loading ? (
            <div className="empty-products"><p>Loading products...</p></div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <h3>No products added yet</h3>
              <p>Use the form above to add your first menu item.</p>
            </div>
          ) : (
            <div className="admin-category-accordions">
              {Object.entries(productGroups).map(([groupName, groupProducts]) => {
                const isExpanded = expandedGroups.includes(groupName);

                return (
                  <section
                    className="admin-category-group"
                    key={groupName}
                    style={{
                      marginBottom: '12px',
                      border: '1px solid #e7dfd5',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#fff',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupName)}
                      aria-expanded={isExpanded}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '16px 18px',
                        border: 0,
                        background: isExpanded ? '#fbf4eb' : '#fff',
                        color: '#34251f',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '16px',
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '22px' }}>
                          {groupIcons[groupName] || '🍽️'}
                        </span>
                        <span>{groupName}</span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#8a7769',
                            background: '#f1ebe4',
                            borderRadius: '20px',
                            padding: '3px 9px',
                          }}
                        >
                          {groupProducts.length}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: '19px',
                          color: '#8a6245',
                          transition: 'transform 0.2s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        ⌄
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="admin-product-list" style={{ padding: '12px' }}>
                        {groupProducts.map((product) => (
                          <article className="admin-product" key={product.id}>
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="admin-product-image"
                              />
                            )}

                            <div className="admin-product-info">
                              <h3>{product.name}</h3>
                              <p>
                                {product.category}
                                {product.section ? ` · ${product.section}` : ''}
                              </p>
                              <strong>
                                {product.price !== null ? `₹${product.price}` : 'Price varies'}
                              </strong>
                              <span className={product.available ? 'availability available' : 'availability unavailable'}>
                                {product.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>

                            <div className="admin-product-actions">
                              <button type="button" onClick={() => handleEdit(product)}>Edit</button>
                              <button type="button" onClick={() => toggleAvailability(product)}>
                                {product.available ? 'Disable' : 'Enable'}
                              </button>
                              <button type="button" className="delete-button" onClick={() => deleteProduct(product)}>
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
