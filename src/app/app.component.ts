import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from '@components/navbar/navbar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule,NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public readonly authService = inject(AuthService);
  title = 'unichat';
}
