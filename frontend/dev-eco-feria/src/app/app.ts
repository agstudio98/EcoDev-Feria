import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GuideComponent } from './layout/guide.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GuideComponent],
  template: `
    <app-guide></app-guide>
    <router-outlet></router-outlet>
  `
})
export class App {
  protected readonly title = signal('dev-eco-feria');
}