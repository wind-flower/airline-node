import { Routes } from '@angular/router';
import { TableComponent } from './components/table/table.component';
import { DetailsComponent } from './components/details/details.component';
import { SearchComponent } from './components/search/search.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { 
    path: 'details/:id', 
    component: DetailsComponent // Route for details page
  },
  { 
    path: '**', 
    redirectTo: '' // Wildcard route
  },
];
