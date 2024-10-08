import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms'; 
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule, 
    FormsModule,
    MatButtonModule
  ],
})
export class SearchComponent {
  @Output() searchValues = new EventEmitter<{ origin: string; destination: string }>();
  searchOrigin: string = '';
  searchDestination: string = '';

  search() {
    this.searchValues.emit({
      origin: this.searchOrigin,
      destination: this.searchDestination,
    });
  }
}
