import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  isDarkMode = false;

  constructor(public readonly authService: AuthService) {}

  ngOnInit() {
    // Check if dark mode is active when component initializes
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  logout() {
    this.authService.logout();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark');

    // Save preference to localStorage
    if (this.isDarkMode) {
        localStorage['theme'] = 'dark';
    } else {
      localStorage['theme'] = 'light';
    }
  }
}
