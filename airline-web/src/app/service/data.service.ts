import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Flight } from '../model/flight.model';
import { environment } from '../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiAirportUrl;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Flight[]> {
    return this.http.get<Flight[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/flight/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getSearch(origin: string, destination: string): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.apiUrl}/search?origin=${origin}&destination=${destination}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('Client-side error:', error.error.message);
      errorMessage = `A client-side error occurred: ${error.error.message}`;
    } else {
      // Backend errors
      console.error(`Backend returned code ${error.status}, body was:`, error.error);

      switch (error.status) {
        case 0:
          // Handle network error or CORS issue
          errorMessage = 'Network error. Please check your internet connection or server status.';
          break;
        case 400:
          errorMessage = 'Bad Request. Please verify your inputs.';
          break;
        case 404:
          errorMessage = 'Resource not found. Please try again later.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again after some time.';
          break;
        default:
          errorMessage = `Unexpected error occurred: ${error.status} - ${error.message}`;
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
