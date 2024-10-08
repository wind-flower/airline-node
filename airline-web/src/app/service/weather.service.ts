import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../environments/environment'; 
@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = process.env.API_KEY;
  private apiUrl = environment.apiWeatherUrl;

  constructor(private http: HttpClient) {}

  getWeather(lat: number, lon: number): Observable<string> {
    const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${this.apiKey}&q=${lat},${lon}`;
    
    return this.http.get<any>(locationUrl).pipe(
      switchMap(locationData => {
        const locationKey = locationData.Key;
        const weatherUrl = `${this.apiUrl}${locationKey}?apikey=${this.apiKey}`;
        
        return this.http.get<any>(weatherUrl).pipe(
          map(weatherData => weatherData[0]?.WeatherText || 'No weather info')
        );
      })
    );
  }
}
