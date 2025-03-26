import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

interface Activity {
  id: number;
  title: string;
  time: string;
  location: string;
  notes: string;
  completed: boolean;
  type?: string;
}

interface ItineraryDay {
  date: Date;
  activities: Activity[];
}

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [SharedModule, CommonModule, DragDropModule],
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss']
})
export class ItineraryComponent implements OnInit {
  itineraryDays: ItineraryDay[] = [];
  activityForm: FormGroup;
  editActivityForm: FormGroup;
  isEditing = false;
  editingActivityId: number | null = null;
  selectedDate: Date = new Date();

  // Activity type options
  activityTypes = [
    { value: 'sightseeing', label: 'Sightseeing', icon: 'photo_camera' },
    { value: 'dining', label: 'Dining', icon: 'restaurant' },
    { value: 'transportation', label: 'Transportation', icon: 'directions_bus' },
    { value: 'accommodation', label: 'Accommodation', icon: 'hotel' },
    { value: 'tour', label: 'Tour/Activity', icon: 'hiking' },
    { value: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
    { value: 'event', label: 'Event', icon: 'event' },
    { value: 'other', label: 'Other', icon: 'more_horiz' }
  ];

  constructor(private fb: FormBuilder) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      time: ['', Validators.required],
      location: [''],
      notes: [''],
      type: ['sightseeing', Validators.required]
    });

    this.editActivityForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      time: ['', Validators.required],
      location: [''],
      notes: [''],
      type: ['sightseeing', Validators.required],
      completed: [false]
    });
  }

  ngOnInit(): void {
    // In a real app, you'd load data from a service
    this.loadSampleData();
  }

  loadSampleData() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    this.itineraryDays = [
      {
        date: today,
        activities: [
          { id: 1, title: 'Arrival at Paris Charles de Gaulle Airport', time: '09:30', location: 'Terminal 2E', notes: 'Flight AF1234', completed: false },
          { id: 2, title: 'Check-in at Hotel', time: '12:00', location: 'Hotel de Paris', notes: 'Reservation #123456', completed: false },
          { id: 3, title: 'Visit Eiffel Tower', time: '15:00', location: 'Champ de Mars', notes: 'Buy tickets in advance', completed: false }
        ]
      },
      {
        date: tomorrow,
        activities: [
          { id: 4, title: 'Louvre Museum', time: '10:00', location: 'Rue de Rivoli', notes: 'Guided tour available', completed: false },
          { id: 5, title: 'Lunch at Le Bistro', time: '13:00', location: 'Saint-Germain', notes: 'Reservation confirmed', completed: false },
          { id: 6, title: 'Seine River Cruise', time: '17:30', location: 'Pont Neuf', notes: 'Evening cruise with dinner', completed: false }
        ]
      },
      {
        date: dayAfterTomorrow,
        activities: [
          { id: 7, title: 'Visit Montmartre & Sacré-Cœur', time: '09:30', location: 'Montmartre', notes: 'Morning walk through artist quarter', completed: false },
          { id: 8, title: 'Shopping at Galeries Lafayette', time: '14:00', location: 'Boulevard Haussmann', notes: 'Tax refund available for purchases over €175', completed: false },
          { id: 9, title: 'Farewell Dinner', time: '20:00', location: 'Le Jules Verne', notes: 'Located in the Eiffel Tower, dress code: formal', completed: false }
        ]
      }
    ];

    this.selectedDate = today;
  }

  getSelectedDayActivities(): Activity[] {
    const selectedDay = this.itineraryDays.find(day =>
      this.isSameDay(day.date, this.selectedDate)
    );

    return selectedDay ? selectedDay.activities : [];
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  onDateChange(event: any): void {
    this.selectedDate = new Date(event.value);
  }

  addActivity(): void {
    if (this.activityForm.invalid) {
      return;
    }

    const formValue = this.activityForm.value;

    // Find or create the day
    let day = this.itineraryDays.find(d => this.isSameDay(d.date, this.selectedDate));

    if (!day) {
      day = {
        date: new Date(this.selectedDate),
        activities: []
      };
      this.itineraryDays.push(day);
      // Sort days chronologically
      this.itineraryDays.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // Create a new activity with a unique ID
    const newId = Math.max(0, ...day.activities.map(a => a.id)) + 1;

    const newActivity: Activity = {
      id: newId,
      title: formValue.title,
      time: formValue.time,
      location: formValue.location || '',
      notes: formValue.notes || '',
      completed: false
    };

    // Add the activity and sort by time
    day.activities.push(newActivity);
    day.activities.sort((a, b) => this.compareTime(a.time, b.time));

    // Reset the form
    this.activityForm.reset({
      title: '',
      time: '',
      location: '',
      notes: '',
      type: 'sightseeing'
    });
  }

  editActivity(activity: Activity): void {
    this.isEditing = true;
    this.editingActivityId = activity.id;

    this.editActivityForm.setValue({
      id: activity.id,
      title: activity.title,
      time: activity.time,
      location: activity.location,
      notes: activity.notes,
      type: activity.type || 'sightseeing',
      completed: activity.completed
    });
  }

  updateActivity(): void {
    if (this.editActivityForm.invalid) {
      return;
    }

    const formValue = this.editActivityForm.value;

    // Find the day and activity
    const day = this.itineraryDays.find(d => this.isSameDay(d.date, this.selectedDate));

    if (day) {
      const activityIndex = day.activities.findIndex(a => a.id === formValue.id);

      if (activityIndex !== -1) {
        // Update the activity
        day.activities[activityIndex] = {
          id: formValue.id,
          title: formValue.title,
          time: formValue.time,
          location: formValue.location,
          notes: formValue.notes,
          completed: formValue.completed
        };

        // Resort activities by time
        day.activities.sort((a, b) => this.compareTime(a.time, b.time));
      }
    }

    // Reset editing state
    this.isEditing = false;
    this.editingActivityId = null;
    this.editActivityForm.reset();
  }

  deleteActivity(activityId: number): void {
    // Find the day
    const day = this.itineraryDays.find(d => this.isSameDay(d.date, this.selectedDate));

    if (day) {
      // Remove the activity
      day.activities = day.activities.filter(a => a.id !== activityId);

      // If the day has no activities, remove the day
      if (day.activities.length === 0) {
        this.itineraryDays = this.itineraryDays.filter(d => !this.isSameDay(d.date, day.date));
      }
    }

    // If we were editing this activity, cancel editing
    if (this.editingActivityId === activityId) {
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingActivityId = null;
    this.editActivityForm.reset();
  }

  toggleComplete(activity: Activity): void {
    activity.completed = !activity.completed;
  }

  onDrop(event: CdkDragDrop<Activity[]>): void {
    const day = this.itineraryDays.find(d => this.isSameDay(d.date, this.selectedDate));
    if (day) {
      moveItemInArray(day.activities, event.previousIndex, event.currentIndex);
    }
  }

  addNewDay(): void {
    // Create a new day
    const newDay: ItineraryDay = {
      date: new Date(this.selectedDate),
      activities: []
    };

    // Check if this day already exists
    const existingDayIndex = this.itineraryDays.findIndex(d =>
      this.isSameDay(d.date, newDay.date)
    );

    if (existingDayIndex === -1) {
      // Add the new day
      this.itineraryDays.push(newDay);
      // Sort days chronologically
      this.itineraryDays.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private compareTime(time1: string, time2: string): number {
    // Convert times to comparable format (assuming HH:MM format)
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    if (hours1 !== hours2) {
      return hours1 - hours2;
    }

    return minutes1 - minutes2;
  }
}
