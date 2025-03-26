import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface ChecklistItem {
  id: number;
  text: string;
  category: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface ChecklistCategory {
  name: string;
  icon: string;
  items: ChecklistItem[];
}

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [SharedModule, CommonModule, DragDropModule, MatProgressBarModule],
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {
  checklist: ChecklistCategory[] = [];
  itemForm: FormGroup;
  editItemForm: FormGroup;
  isEditing = false;
  editingItemId: number | null = null;

  categories = [
    { name: 'documents', label: 'Documents', icon: 'description' },
    { name: 'clothing', label: 'Clothing', icon: 'checkroom' },
    { name: 'toiletries', label: 'Toiletries', icon: 'bathroom' },
    { name: 'electronics', label: 'Electronics', icon: 'devices' },
    { name: 'health', label: 'Health & Medicine', icon: 'health_and_safety' },
    { name: 'misc', label: 'Miscellaneous', icon: 'more_horiz' }
  ];

  priorities = [
    { value: 'high', label: 'High', color: 'warn' },
    { value: 'medium', label: 'Medium', color: 'accent' },
    { value: 'low', label: 'Low', color: 'primary' }
  ];

  constructor(private fb: FormBuilder) {
    this.itemForm = this.fb.group({
      text: ['', Validators.required],
      category: ['documents', Validators.required],
      priority: ['medium', Validators.required],
      notes: ['']
    });

    this.editItemForm = this.fb.group({
      id: [null],
      text: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['medium', Validators.required],
      completed: [false],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // In a real app, you'd load data from a service
    this.loadDefaultChecklist();
  }

  loadDefaultChecklist(): void {
    // Create a category structure with some default items
    this.checklist = this.categories.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      items: []
    }));

    // Add some default items to each category
    const defaultItems: ChecklistItem[] = [
      { id: 1, text: 'Passport', category: 'documents', completed: false, priority: 'high', notes: 'Check expiration date (must be valid for at least 6 months)' },
      { id: 2, text: 'Visa', category: 'documents', completed: false, priority: 'high' },
      { id: 3, text: 'Flight tickets', category: 'documents', completed: false, priority: 'high' },
      { id: 4, text: 'Hotel reservations', category: 'documents', completed: false, priority: 'high' },
      { id: 5, text: 'Travel insurance', category: 'documents', completed: false, priority: 'medium' },
      { id: 6, text: 'Driver\'s license', category: 'documents', completed: false, priority: 'medium' },

      { id: 7, text: 'T-shirts', category: 'clothing', completed: false, priority: 'medium', notes: 'Pack for the weather at destination' },
      { id: 8, text: 'Pants/shorts', category: 'clothing', completed: false, priority: 'medium' },
      { id: 9, text: 'Underwear', category: 'clothing', completed: false, priority: 'high' },
      { id: 10, text: 'Socks', category: 'clothing', completed: false, priority: 'medium' },
      { id: 11, text: 'Jacket/sweater', category: 'clothing', completed: false, priority: 'medium' },
      { id: 12, text: 'Sleepwear', category: 'clothing', completed: false, priority: 'low' },

      { id: 13, text: 'Toothbrush', category: 'toiletries', completed: false, priority: 'high' },
      { id: 14, text: 'Toothpaste', category: 'toiletries', completed: false, priority: 'high' },
      { id: 15, text: 'Shampoo/conditioner', category: 'toiletries', completed: false, priority: 'medium' },
      { id: 16, text: 'Soap/body wash', category: 'toiletries', completed: false, priority: 'medium' },
      { id: 17, text: 'Deodorant', category: 'toiletries', completed: false, priority: 'high' },

      { id: 18, text: 'Phone charger', category: 'electronics', completed: false, priority: 'high' },
      { id: 19, text: 'Camera', category: 'electronics', completed: false, priority: 'medium' },
      { id: 20, text: 'Adapters/converters', category: 'electronics', completed: false, priority: 'high', notes: 'Check the plug type for your destination' },
      { id: 21, text: 'Laptop/tablet', category: 'electronics', completed: false, priority: 'medium' },

      { id: 22, text: 'Prescription medication', category: 'health', completed: false, priority: 'high', notes: 'Bring enough for the entire trip plus a few extra days' },
      { id: 23, text: 'Pain relievers', category: 'health', completed: false, priority: 'medium' },
      { id: 24, text: 'Bandages', category: 'health', completed: false, priority: 'medium' },
      { id: 25, text: 'Hand sanitizer', category: 'health', completed: false, priority: 'medium' },

      { id: 26, text: 'Travel pillow', category: 'misc', completed: false, priority: 'low' },
      { id: 27, text: 'Books/entertainment', category: 'misc', completed: false, priority: 'low' },
      { id: 28, text: 'Snacks', category: 'misc', completed: false, priority: 'low' },
      { id: 29, text: 'Water bottle', category: 'misc', completed: false, priority: 'medium' }
    ];

    // Assign items to their respective categories
    defaultItems.forEach(item => {
      const category = this.checklist.find(c => c.name === item.category);
      if (category) {
        category.items.push(item);
      }
    });
  }

  getCategoryLabel(name: string): string {
    const category = this.categories.find(c => c.name === name);
    return category ? category.label : name;
  }

  getCategoryIcon(name: string): string {
    const category = this.categories.find(c => c.name === name);
    return category ? category.icon : 'folder';
  }

  getPriorityColor(priority: string): string {
    const priorityObj = this.priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '';
  }

  getProgress(category: ChecklistCategory): number {
    if (category.items.length === 0) return 0;

    const completed = category.items.filter(item => item.completed).length;
    return Math.round((completed / category.items.length) * 100);
  }

  getTotalProgress(): number {
    const allItems = this.checklist.flatMap(c => c.items);
    if (allItems.length === 0) return 0;

    const completed = allItems.filter(item => item.completed).length;
    return Math.round((completed / allItems.length) * 100);
  }

  addItem(): void {
    if (this.itemForm.invalid) return;

    const formValue = this.itemForm.value;
    const category = this.checklist.find(c => c.name === formValue.category);

    if (category) {
      // Create a new item with a unique ID
      const ids = this.checklist.flatMap(c => c.items.map(i => i.id));
      const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

      const newItem: ChecklistItem = {
        id: newId,
        text: formValue.text,
        category: formValue.category,
        priority: formValue.priority,
        completed: false,
        notes: formValue.notes || undefined
      };

      category.items.push(newItem);

      // Reset form
      this.itemForm.reset({
        text: '',
        category: formValue.category,
        priority: 'medium',
        notes: ''
      });
    }
  }

  editItem(item: ChecklistItem): void {
    this.isEditing = true;
    this.editingItemId = item.id;

    this.editItemForm.setValue({
      id: item.id,
      text: item.text,
      category: item.category,
      priority: item.priority,
      completed: item.completed,
      notes: item.notes || ''
    });
  }

  updateItem(): void {
    if (this.editItemForm.invalid) return;

    const formValue = this.editItemForm.value;

    // Find the original item
    let originalItem: ChecklistItem | undefined;
    let originalCategory: ChecklistCategory | undefined;

    for (const category of this.checklist) {
      const item = category.items.find(i => i.id === formValue.id);
      if (item) {
        originalItem = item;
        originalCategory = category;
        break;
      }
    }

    if (!originalItem || !originalCategory) return;

    // If category changed, move the item
    if (originalItem.category !== formValue.category) {
      // Remove from old category
      originalCategory.items = originalCategory.items.filter(i => i.id !== formValue.id);

      // Add to new category
      const newCategory = this.checklist.find(c => c.name === formValue.category);
      if (newCategory) {
        newCategory.items.push({
          id: formValue.id,
          text: formValue.text,
          category: formValue.category,
          priority: formValue.priority,
          completed: formValue.completed,
          notes: formValue.notes || undefined
        });
      }
    } else {
      // Update the item in its current category
      const index = originalCategory.items.findIndex(i => i.id === formValue.id);
      if (index !== -1) {
        originalCategory.items[index] = {
          id: formValue.id,
          text: formValue.text,
          category: formValue.category,
          priority: formValue.priority,
          completed: formValue.completed,
          notes: formValue.notes || undefined
        };
      }
    }

    // Reset editing state
    this.isEditing = false;
    this.editingItemId = null;
    this.editItemForm.reset();
  }

  deleteItem(itemId: number): void {
    for (const category of this.checklist) {
      const index = category.items.findIndex(i => i.id === itemId);
      if (index !== -1) {
        category.items.splice(index, 1);

        // If we were editing this item, cancel editing
        if (this.editingItemId === itemId) {
          this.cancelEdit();
        }

        break;
      }
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingItemId = null;
    this.editItemForm.reset();
  }

  toggleComplete(item: ChecklistItem): void {
    item.completed = !item.completed;
  }

  onDrop(event: CdkDragDrop<ChecklistItem[]>, categoryItems: ChecklistItem[]): void {
    moveItemInArray(categoryItems, event.previousIndex, event.currentIndex);
  }

  getCompletedItems(category: ChecklistCategory): number {
    return category.items.filter(item => item.completed).length;
  }
}
