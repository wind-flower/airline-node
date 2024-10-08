import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../service/data.service';
import { Flight } from '../../model/flight.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card'; 
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { forkJoin } from 'rxjs';

import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { WeatherService } from '../../service/weather.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatDialogActions,
    MatButtonModule
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  flight: Flight | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { flightId: number },
    private dataService: DataService,
    private weatherService: WeatherService 
  ) {}

  ngOnInit(): void {
    this.getFlightDetailsAndWeather(this.data.flightId);
  }

  getFlightDetailsAndWeather(id: number): void {
    this.isLoading = true;

    // Fetch flight details
    this.dataService.getById(id).subscribe({
      next: (flight) => {
        this.flight = flight;

        // Use forkJoin to fetch both origin and destination weather at the same time
        const weatherRequests = forkJoin({
          originWeather: this.weatherService.getWeather(flight.origin_latitude, flight.origin_longitude),
          destinationWeather: this.weatherService.getWeather(flight.destination_latitude, flight.destination_longitude),
        });

        // Subscribe to the weather data once both requests are complete
        weatherRequests.subscribe({
          next: (weatherData) => {
            if (this.flight) {
              this.flight.origin_weather = weatherData.originWeather;
              this.flight.destination_weather = weatherData.destinationWeather;
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = 'Failed to load weather data';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}