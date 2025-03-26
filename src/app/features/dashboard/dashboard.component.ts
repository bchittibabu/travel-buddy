import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  upcomingTrips = [
    {
      id: 1,
      destination: 'Paris, France',
      startDate: new Date('2025-04-15'),
      endDate: new Date('2025-04-22'),
      image: 'assets/images/paris.jpg'
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      startDate: new Date('2025-05-10'),
      endDate: new Date('2025-05-20'),
      image: 'assets/images/tokyo.jpg'
    },
    {
      id: 3,
      destination: 'Cancun, Mexico',
      startDate: new Date('2025-06-05'),
      endDate: new Date('2025-06-12'),
      image: 'assets/images/cancun.jpg'
    }
  ];

  weatherData = {
    paris: { temp: 18, condition: 'Partly Cloudy', icon: 'wb_cloudy' },
    tokyo: { temp: 22, condition: 'Sunny', icon: 'wb_sunny' },
    cancun: { temp: 30, condition: 'Clear Sky', icon: 'wb_sunny' }
  };

  recentCurrencies = [
    { code: 'EUR', name: 'Euro', rate: 0.93 },
    { code: 'JPY', name: 'Japanese Yen', rate: 144.80 },
    { code: 'MXN', name: 'Mexican Peso', rate: 17.60 }
  ];

  getTripDates(trip: any): string {
    const startMonth = trip.startDate.toLocaleString('default', { month: 'short' });
    const endMonth = trip.endDate.toLocaleString('default', { month: 'short' });

    const startDay = trip.startDate.getDate();
    const endDay = trip.endDate.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  }

  getUpcomingTasks() {
    return [
      { task: 'Book hotel for Tokyo trip', dueDate: new Date('2025-04-10'), isCompleted: false },
      { task: 'Renew passport', dueDate: new Date('2025-04-05'), isCompleted: true },
      { task: 'Purchase travel insurance', dueDate: new Date('2025-03-30'), isCompleted: false },
      { task: 'Exchange currency for Paris trip', dueDate: new Date('2025-04-10'), isCompleted: false }
    ];
  }
}
