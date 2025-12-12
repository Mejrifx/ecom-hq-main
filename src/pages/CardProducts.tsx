import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Copy, ImageIcon, Package, ChevronRight, RotateCcw, X } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { CardProduct, Card } from '../types';
import { Modal } from '../components/Modal';

export function CardProducts() {
  const { state, dispatch, addActivity } = useData();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [createProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [createCardModalOpen, setCreateCardModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CardProduct | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [viewingCard, setViewingCard] = useState<Card | null>(null);

  // Get selected product
  const selectedProduct = useMemo(() => {
    return (state.cardProducts || []).find(p => p.id === selectedProductId) || null;
  }, [state.cardProducts, selectedProductId]);

  // Get cards for selected product
  const productCards = useMemo(() => {
    if (!selectedProduct) return [];
    return (state.cards || []).filter(c => c.productId === selectedProduct.id);
  }, [state.cards, selectedProduct]);

  // Auto-select first product on mount
  React.useEffect(() => {
    if ((state.cardProducts || []).length > 0 && !selectedProductId) {
      setSelectedProductId(state.cardProducts[0].id);
    }
  }, [state.cardProducts, selectedProductId]);

  const handleCreateProduct = (name: string, description?: string) => {
    const product: CardProduct = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_CARD_PRODUCT', payload: product });
    addActivity('created', 'cardProduct', name);
    setSelectedProductId(product.id);
    setCreateProductModalOpen(false);
  };

  const handleUpdateProduct = (product: CardProduct) => {
    dispatch({ type: 'UPDATE_CARD_PRODUCT', payload: product });
    addActivity('updated', 'cardProduct', product.name);
    setEditingProduct(null);
  };

  const handleDeleteProduct = () => {
    if (deleteProductId) {
      const product = (state.cardProducts || []).find(p => p.id === deleteProductId);
      // Delete all cards in this product
      (state.cards || []).forEach(card => {
        if (card.productId === deleteProductId) {
          dispatch({ type: 'DELETE_CARD', payload: card.id });
        }
      });
      dispatch({ type: 'DELETE_CARD_PRODUCT', payload: deleteProductId });
      if (product) addActivity('deleted', 'cardProduct', product.name);
      if (selectedProductId === deleteProductId) {
        setSelectedProductId(null);
      }
      setDeleteProductId(null);
    }
  };

  const handleCreateCard = (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'productId'>) => {
    if (!selectedProduct) return;
    const newCard: Card = {
      ...card,
      productId: selectedProduct.id,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_CARD', payload: newCard });
    addActivity('created', 'card', card.title);
    setCreateCardModalOpen(false);
  };

  const handleUpdateCard = (card: Card) => {
    dispatch({ type: 'UPDATE_CARD', payload: card });
    addActivity('updated', 'card', card.title);
    setEditingCard(null);
  };

  const handleDeleteCard = () => {
    if (deleteCardId) {
      const card = (state.cards || []).find(c => c.id === deleteCardId);
      dispatch({ type: 'DELETE_CARD', payload: deleteCardId });
      if (card) addActivity('deleted', 'card', card.title);
      setDeleteCardId(null);
    }
  };

  const handleDuplicateCard = (cardId: string) => {
    const card = (state.cards || []).find(c => c.id === cardId);
    if (card) {
      const newCard: Card = {
        ...card,
        id: crypto.randomUUID(),
        title: `${card.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: 'ADD_CARD', payload: newCard });
      addActivity('duplicated', 'card', card.title);
    }
  };

  return (
    <div className="flex h-full">
      {/* Products List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Card Products</h2>
          <button
            onClick={() => setCreateProductModalOpen(true)}
            className="btn-primary w-full text-sm"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto">
          {(state.cardProducts || []).length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No card products yet
            </div>
          ) : (
            (state.cardProducts || []).map(product => (
              <button
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className={`w-full text-left p-4 border-b border-border transition-colors ${
                  selectedProductId === product.id
                    ? 'bg-sidebar-accent'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {(state.cards || []).filter(c => c.productId === product.id).length} cards
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Cards View */}
      <div className="flex-1 flex flex-col">
        {selectedProduct ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedProduct.name}
                  onChange={e => handleUpdateProduct({ ...selectedProduct, name: e.target.value, updatedAt: new Date() })}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none text-foreground"
                />
                {selectedProduct.description && (
                  <input
                    type="text"
                    value={selectedProduct.description}
                    onChange={e => handleUpdateProduct({ ...selectedProduct, description: e.target.value, updatedAt: new Date() })}
                    placeholder="Product description..."
                    className="text-sm text-muted-foreground bg-transparent border-none focus:outline-none w-full mt-1"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCreateCardModalOpen(true)}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Card
                </button>
                <button
                  onClick={() => setDeleteProductId(selectedProduct.id)}
                  className="btn-icon text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {productCards.length === 0 ? (
                <div className="card-elevated p-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No cards in this product yet.</p>
                  <button onClick={() => setCreateCardModalOpen(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create First Card
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productCards.map(card => (
                    <CardItem
                      key={card.id}
                      card={card}
                      onView={() => setViewingCard(card)}
                      onEdit={() => setEditingCard(card)}
                      onDelete={() => setDeleteCardId(card.id)}
                      onDuplicate={() => handleDuplicateCard(card.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a card product or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={createProductModalOpen}
        onClose={() => setCreateProductModalOpen(false)}
        onCreate={handleCreateProduct}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
          product={editingProduct}
        />
      )}

      {/* Create/Edit Card Modal */}
      <CardModal
        isOpen={createCardModalOpen || !!editingCard}
        onClose={() => {
          setCreateCardModalOpen(false);
          setEditingCard(null);
        }}
        onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
        card={editingCard}
        productName={selectedProduct?.name || ''}
      />

      {/* Delete Product Confirmation */}
      <Modal
        isOpen={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        title="Delete Card Product"
        size="sm"
      >
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete this card product? All cards in this product will also be deleted. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteProductId(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteProduct} className="btn-primary bg-destructive hover:bg-destructive/90">
            Delete
          </button>
        </div>
      </Modal>

      {/* Delete Card Confirmation */}
      <Modal
        isOpen={!!deleteCardId}
        onClose={() => setDeleteCardId(null)}
        title="Delete Card"
        size="sm"
      >
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete this card? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteCardId(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteCard} className="btn-primary bg-destructive hover:bg-destructive/90">
            Delete
          </button>
        </div>
      </Modal>

      {/* Card Viewer */}
      {viewingCard && (
        <CardViewer
          card={viewingCard}
          onClose={() => setViewingCard(null)}
        />
      )}
    </div>
  );
}

interface CardItemProps {
  card: Card;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function CardItem({ card, onView, onEdit, onDelete, onDuplicate }: CardItemProps) {
  return (
    <div className="card-elevated overflow-hidden group cursor-pointer" onClick={onView}>
      {/* Front Side Preview (Image + Title) */}
      <div className="recipe-card-image">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.title} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{card.title}</h3>
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
          {card.ingredients.split('\n').slice(0, 2).join(', ')}...
        </p>

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="btn-icon flex-1 justify-center">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDuplicate} className="btn-icon flex-1 justify-center">
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="btn-icon flex-1 justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

function CreateProductModal({ isOpen, onClose, onCreate }: CreateProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Card Product">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Home Meal Cards, Lunch-Box Edition..."
              className="input-base"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this card product..."
              className="input-base"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            Create Product
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (product: CardProduct) => void;
  product: CardProduct;
}

function EditProductModal({ isOpen, onClose, onUpdate, product }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');

  React.useEffect(() => {
    setName(product.name);
    setDescription(product.description || '');
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdate({ ...product, name: name.trim(), description: description.trim() || undefined, updatedAt: new Date() });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Card Product">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-base"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            Update Product
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Card | Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'productId'>) => void;
  card?: Card | null;
  productName: string;
}

function CardModal({ isOpen, onClose, onSubmit, card, productName }: CardModalProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [ingredients, setIngredients] = useState(card?.ingredients || '');
  const [instructions, setInstructions] = useState(card?.instructions || '');
  const [imagePreview, setImagePreview] = useState<string | null>(card?.imageUrl || null);

  React.useEffect(() => {
    if (card) {
      setTitle(card.title);
      setIngredients(card.ingredients);
      setInstructions(card.instructions);
      setImagePreview(card.imageUrl);
    } else {
      setTitle('');
      setIngredients('');
      setInstructions('');
      setImagePreview(null);
    }
  }, [card, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (card) {
      onSubmit({
        ...card,
        title,
        ingredients,
        instructions,
        imageUrl: imagePreview,
        updatedAt: new Date(),
      });
    } else {
      onSubmit({
        title,
        ingredients,
        instructions,
        imageUrl: imagePreview,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={card ? 'Edit Card' : `New Card - ${productName}`}
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Meal Name (Front Side)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Meal name..."
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Meal Image (Front Side)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-base file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium file:cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Ingredients (Back Side)</label>
              <textarea
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                placeholder="One ingredient per line..."
                className="input-base min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Instructions (Back Side)</label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Step-by-step cooking instructions..."
                className="input-base min-h-[100px] resize-y"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Card Preview
            </p>
            <div className="space-y-4">
              {/* Front Side */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Front Side</p>
                <div className="recipe-card bg-card">
                  <div className="recipe-card-image">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">
                      {title || 'Meal Name'}
                    </h3>
                  </div>
                </div>
              </div>
              {/* Back Side */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Back Side</p>
                <div className="recipe-card bg-card p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Ingredients:</p>
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {ingredients || 'Ingredients list...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Instructions:</p>
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {instructions || 'Cooking instructions...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            {card ? 'Update' : 'Create'} Card
          </button>
        </div>
      </form>
    </Modal>
  );
}
