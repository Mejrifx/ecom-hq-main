import React, { useState } from 'react';
import { Plus, Clock, PoundSterling, Pencil, Trash2, Copy, Printer, ImageIcon } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';
import { RecipeCard } from '../types';
import { Modal } from '../components/Modal';

export function RecipeCards() {
  const { state, dispatch, addActivity } = useData();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeCard | null>(null);
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null);

  const handleCreateRecipe = (recipe: Omit<RecipeCard, 'id' | 'createdAt'>) => {
    const newRecipe: RecipeCard = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_RECIPE', payload: newRecipe });
    addActivity('created', 'recipe', recipe.title);
    setCreateModalOpen(false);
  };

  const handleUpdateRecipe = (recipe: RecipeCard) => {
    dispatch({ type: 'UPDATE_RECIPE', payload: recipe });
    addActivity('updated', 'recipe', recipe.title);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = () => {
    if (deleteRecipeId) {
      const recipe = state.recipes.find(r => r.id === deleteRecipeId);
      dispatch({ type: 'DELETE_RECIPE', payload: deleteRecipeId });
      if (recipe) addActivity('deleted', 'recipe', recipe.title);
      setDeleteRecipeId(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const recipe = state.recipes.find(r => r.id === id);
    dispatch({ type: 'DUPLICATE_RECIPE', payload: id });
    if (recipe) addActivity('duplicated', 'recipe', recipe.title);
  };

  const handleExportPDF = () => {
    alert('PDF generator would run here');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Recipe Cards</h1>
          <p className="text-muted-foreground">Your personal meal deck collection</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="btn-secondary">
            <Printer className="w-4 h-4" />
            Export PDF
          </button>
          <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Card
          </button>
        </div>
      </div>

      {/* Grid */}
      {state.recipes.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No recipe cards yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.recipes.map(recipe => (
            <RecipeCardItem
              key={recipe.id}
              recipe={recipe}
              onEdit={() => setEditingRecipe(recipe)}
              onDelete={() => setDeleteRecipeId(recipe.id)}
              onDuplicate={() => handleDuplicate(recipe.id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <RecipeModal
        isOpen={createModalOpen || !!editingRecipe}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingRecipe(null);
        }}
        onSubmit={editingRecipe ? handleUpdateRecipe : handleCreateRecipe}
        recipe={editingRecipe}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteRecipeId}
        onClose={() => setDeleteRecipeId(null)}
        title="Delete Recipe Card"
        size="sm"
      >
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete this recipe? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteRecipeId(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteRecipe} className="btn-primary bg-destructive hover:bg-destructive/90">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface RecipeCardItemProps {
  recipe: RecipeCard;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function RecipeCardItem({ recipe, onEdit, onDelete, onDuplicate }: RecipeCardItemProps) {
  return (
    <div className="card-elevated overflow-hidden group">
      {/* Image */}
      <div className="recipe-card-image">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{recipe.title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.timeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <PoundSterling className="w-4 h-4" />
            {recipe.cost}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {recipe.ingredients.split('\n').slice(0, 3).join(', ')}...
        </p>

        {/* Actions */}
        <div className="flex gap-2">
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

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (recipe: RecipeCard | Omit<RecipeCard, 'id' | 'createdAt'>) => void;
  recipe?: RecipeCard | null;
}

function RecipeModal({ isOpen, onClose, onSubmit, recipe }: RecipeModalProps) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [ingredients, setIngredients] = useState(recipe?.ingredients || '');
  const [steps, setSteps] = useState(recipe?.steps || '');
  const [cost, setCost] = useState(recipe?.cost || 0);
  const [timeMinutes, setTimeMinutes] = useState(recipe?.timeMinutes || 30);
  const [imagePreview, setImagePreview] = useState<string | null>(recipe?.imageUrl || null);

  React.useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setIngredients(recipe.ingredients);
      setSteps(recipe.steps);
      setCost(recipe.cost);
      setTimeMinutes(recipe.timeMinutes);
      setImagePreview(recipe.imageUrl);
    } else {
      setTitle('');
      setIngredients('');
      setSteps('');
      setCost(0);
      setTimeMinutes(30);
      setImagePreview(null);
    }
  }, [recipe, isOpen]);

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

    if (recipe) {
      onSubmit({
        ...recipe,
        title,
        ingredients,
        steps,
        cost,
        timeMinutes,
        imageUrl: imagePreview,
      });
    } else {
      onSubmit({
        title,
        ingredients,
        steps,
        cost,
        timeMinutes,
        imageUrl: imagePreview,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recipe ? 'Edit Recipe Card' : 'New Recipe Card'}
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Recipe name..."
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-base file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium file:cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Ingredients</label>
              <textarea
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                placeholder="One ingredient per line..."
                className="input-base min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Steps</label>
              <textarea
                value={steps}
                onChange={e => setSteps(e.target.value)}
                placeholder="1. First step\n2. Second step..."
                className="input-base min-h-[100px] resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cost (£)</label>
                <input
                  type="number"
                  value={cost}
                  onChange={e => setCost(Number(e.target.value))}
                  min="0"
                  step="0.5"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time (min)</label>
                <input
                  type="number"
                  value={timeMinutes}
                  onChange={e => setTimeMinutes(Number(e.target.value))}
                  min="1"
                  className="input-base"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Live Preview
            </p>
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
                <h3 className="font-semibold text-foreground mb-2">
                  {title || 'Recipe Title'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {timeMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <PoundSterling className="w-4 h-4" />
                    {cost}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ingredients ? ingredients.split('\n').slice(0, 3).join(', ') : 'Ingredients...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            {recipe ? 'Update' : 'Create'} Card
          </button>
        </div>
      </form>
    </Modal>
  );
}
