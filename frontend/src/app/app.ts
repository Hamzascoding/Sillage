import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Inject the HTTP Client using the modern inject() method
  private readonly http = inject(HttpClient);

  readonly title = signal('frontend');
  
  // Create a new signal to hold the backend response data (starts as null)
  protected readonly backendData = signal<any>(null);

  ngOnInit(): void {
    // Make the HTTP request to your Express API
    this.http.get('http://localhost:3000/api/data').subscribe({
      next: (response) => {
        // Update the signal value with the data from Express
        this.backendData.set(response);
      },
      error: (err) => console.error('Error connecting to backend:', err)
    });
  }
}
