import { Component, OnInit } from '@angular/core';
import { Flight } from './model/flight.model';
import { DataService } from './service/data.service';
import { TableComponent } from './components/table/table.component';
import { SearchComponent } from './components/search/search.component';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    TableComponent,
    SearchComponent,
    RouterModule,
    MatDialogModule
  ],
})
export class AppComponent implements OnInit {
  title = 'airline';
  data: Flight[] = [];
  filteredData: Flight[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadData(); // Load flight data when the app initializes
  }

  loadData() {
    this.isLoading = true;
    this.dataService.getAll().subscribe({
      next: (response: Flight[]) => {
        this.data = response;
        this.filteredData = response; // Initially set filtered data to all data
        this.isLoading = false;
        console.log(this.data);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load flight data';
        this.isLoading = false;
      },
    });
  }

  onSearch({ origin, destination }: { origin: string; destination: string }) {
    this.isLoading = true;
    this.errorMessage = null; // Reset error message

    if (origin !== "" || destination !== "") {
      // If there are any search parameters
      this.filteredData = this.data.filter(flight => {
        const matchesOrigin = flight.origin.toLowerCase().includes(origin.toLowerCase());
        const matchesDestination = flight.destination.toLowerCase().includes(destination.toLowerCase());
        return matchesOrigin && matchesDestination;
      });
      this.isLoading = false;

      // If no flights match the search criteria, set an error message
      if (this.filteredData.length === 0) {
        this.errorMessage = 'No flights found for the selected origin and destination.';
      }
    } else {
      // Reset the filtered data if search parameters are empty
      this.filteredData = this.data; // Reset to all data
      this.isLoading = false;
    }
  }
}
