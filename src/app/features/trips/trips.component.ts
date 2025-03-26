import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  image?: string;
  tags?: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  tripForm: FormGroup;
  isEditing = false;
  editingTripId: number | null = null;
  searchQuery = '';
  filterStatus = 'all';
  sortBy = 'startDate';
  showOnlyFavorites = false;

  // For stats dashboard
  totalTrips = 0;
  upcomingTrips = 0;
  completedTrips = 0;
  cancelledTrips = 0;

  // Sample destinations for the destination suggestions
  popularDestinations = [
    { name: 'Paris, France', image: 'assets/images/paris.jpg' },
    { name: 'Tokyo, Japan', image: 'assets/images/tokyo.jpg' },
    { name: 'Cancun, Mexico', image: 'assets/images/cancun.jpg' },
    { name: 'Rome, Italy', image: 'assets/images/rome.jpg' },
    { name: 'New York, USA', image: 'assets/images/newyork.jpg' },
    { name: 'Barcelona, Spain', image: 'assets/images/barcelona.jpg' }
  ];

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.tripForm = this.fb.group({
      name: ['', [Validators.required]],
      destination: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      description: [''],
      tags: [''],
      image: [''],
      status: ['upcoming', [Validators.required]]
    }, { validator: this.dateRangeValidator });
  }

  ngOnInit(): void {
    // Load sample trips data
    this.loadSampleTrips();
    this.applyFilters();
    this.calculateStats();
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      return { 'dateRange': true };
    }
    return null;
  }

  loadSampleTrips(): void {
    this.trips = [
      {
        id: 1,
        name: 'Summer in Paris',
        destination: 'Paris, France',
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-25'),
        description: 'Exploring Paris in the summer, visiting the Eiffel Tower, Louvre, and other attractions.',
        image: 'assets/images/paris.jpg',
        tags: ['cultural', 'romantic', 'city'],
        status: 'upcoming'
      },
      {
        id: 2,
        name: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        startDate: new Date('2025-09-10'),
        endDate: new Date('2025-09-20'),
        description: 'Exploring Tokyo\'s vibrant culture, technology, and cuisine.',
        image: 'assets/images/tokyo.jpg',
        tags: ['adventure', 'cultural', 'food'],
        status: 'upcoming'
      },
      {
        id: 3,
        name: 'Mexican Beach Getaway',
        destination: 'Cancun, Mexico',
        startDate: new Date('2025-03-05'),
        endDate: new Date('2025-03-12'),
        description: 'Relaxing on the beautiful beaches of Cancun and visiting nearby Mayan ruins.',
        image: 'assets/images/cancun.jpg',
        tags: ['beach', 'relaxation', 'history'],
        status: 'completed'
      },
      {
        id: 4,
        name: 'Roman Holiday',
        destination: 'Rome, Italy',
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-30'),
        description: 'Exploring the ancient ruins and enjoying Italian cuisine.',
        image: 'assets/images/rome.jpg',
        tags: ['historical', 'cultural', 'food'],
        status: 'cancelled'
      }
    ];
  }

  calculateStats(): void {
    this.totalTrips = this.trips.length;
    this.upcomingTrips = this.trips.filter(trip => trip.status === 'upcoming').length;
    this.completedTrips = this.trips.filter(trip => trip.status === 'completed').length;
    this.cancelledTrips = this.trips.filter(trip => trip.status === 'cancelled').length;
  }

  applyFilters(): void {
    // First, filter by search query
    let filtered = this.trips.filter(trip => {
      const query = this.searchQuery.toLowerCase();
      return (
        trip.name.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        (trip.description && trip.description.toLowerCase().includes(query)) ||
        (trip.tags && trip.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    });

    // Then, filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(trip => trip.status === this.filterStatus);
    }

    // Then, sort
    filtered.sort((a, b) => {
      if (this.sortBy === 'startDate') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (this.sortBy === 'destination') {
        return a.destination.localeCompare(b.destination);
      } else if (this.sortBy === 'duration') {
        const aDuration = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
        const bDuration = new Date(b.endDate).getTime() - new Date(b.startDate).getTime();
        return aDuration - bDuration;
      }
      return 0;
    });

    this.filteredTrips = filtered;
  }

  searchTrips(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  filterByStatus(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  sortTrips(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  addTrip(): void {
    if (this.tripForm.invalid) {
      return;
    }

    const formValue = this.tripForm.value;

    // Create a new trip with a unique ID
    const newId = Math.max(0, ...this.trips.map(t => t.id)) + 1;

    const newTrip: Trip = {
      id: newId,
      name: formValue.name,
      destination: formValue.destination,
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      description: formValue.description,
      image: formValue.image || this.getImageForDestination(formValue.destination),
      tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : [],
      status: formValue.status
    };

    this.trips.push(newTrip);
    this.tripForm.reset({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      description: '',
      tags: '',
      image: '',
      status: 'upcoming'
    });

    this.applyFilters();
    this.calculateStats();
  }

  getImageForDestination(destination: string): string {
    // If we have a predefined image for the destination, use it
    const found = this.popularDestinations.find(
      d => d.name.toLowerCase() === destination.toLowerCase()
    );

    if (found) {
      return found.image;
    }

    // Otherwise, use a default image
    return 'assets/images/default-trip.jpg';
  }

  editTrip(trip: Trip): void {
    this.isEditing = true;
    this.editingTripId = trip.id;

    this.tripForm.setValue({
      name: trip.name,
      destination: trip.destination,
      startDate: this.formatDateForInput(trip.startDate),
      endDate: this.formatDateForInput(trip.endDate),
      description: trip.description || '',
      tags: trip.tags ? trip.tags.join(', ') : '',
      image: trip.image || '',
      status: trip.status
    });
  }

  updateTrip(): void {
    if (this.tripForm.invalid || this.editingTripId === null) {
      return;
    }

    const formValue = this.tripForm.value;
    const index = this.trips.findIndex(t => t.id === this.editingTripId);

    if (index !== -1) {
      this.trips[index] = {
        ...this.trips[index],
        name: formValue.name,
        destination: formValue.destination,
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        description: formValue.description,
        image: formValue.image || this.getImageForDestination(formValue.destination),
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : [],
        status: formValue.status
      };

      this.isEditing = false;
      this.editingTripId = null;
      this.tripForm.reset({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        description: '',
        tags: '',
        image: '',
        status: 'upcoming'
      });

      this.applyFilters();
      this.calculateStats();
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingTripId = null;
    this.tripForm.reset({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      description: '',
      tags: '',
      image: '',
      status: 'upcoming'
    });
  }

  deleteTrip(id: number): void {
    // In a real app, you'd want to show a confirmation dialog
    this.trips = this.trips.filter(trip => trip.id !== id);
    this.applyFilters();
    this.calculateStats();
  }

  formatDateForInput(date: Date): string {
    // Format the date as YYYY-MM-DD for input[type="date"]
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  getDurationInDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getTripStatus(trip: Trip): string {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (trip.status === 'cancelled') {
      return 'Cancelled';
    } else if (now < start) {
      return 'Upcoming';
    } else if (now >= start && now <= end) {
      return 'Ongoing';
    } else {
      return 'Completed';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'ongoing':
        return 'accent';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'warn';
      default:
        return '';
    }
  }

  getTripStatusIcon(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'schedule';
      case 'ongoing':
        return 'flight_takeoff';
      case 'completed':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }
}
