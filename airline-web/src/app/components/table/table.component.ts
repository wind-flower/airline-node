import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Flight } from '../../model/flight.model';
import { MatPaginator } from '@angular/material/paginator';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog'; 
import { DetailsComponent } from '../details/details.component'; 
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    MatTableModule,
    CommonModule,
    MatPaginator,
    MatButtonModule
  ],
})
export class TableComponent implements OnChanges, AfterViewInit {
  @Input() dataSource: Flight[] = []; 
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  dataSourceMat = new MatTableDataSource<Flight>();

  displayedColumns: string[] = ['flightNumber', 'origin', 'origin_name', 'destination', 'destination_name', 'actions'];

  constructor(private dialog: MatDialog) {} // Inject MatDialog

  // Detect changes in input and update the data source
  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataSource']) {
      this.dataSourceMat.data = this.dataSource;
    }
  }

  ngAfterViewInit() {
    this.dataSourceMat.paginator = this.paginator; // Set the paginator
  }

  // Method to open the dialog
  openDialog(flightId: number): void {
    const dialogRef = this.dialog.open(DetailsComponent, {
      width: '600px',
      data: { flightId: flightId } // Pass the flight ID as data
    });

  }
}
