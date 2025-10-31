import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  isMobile = false;

  constructor(
    public readonly authService: AuthService,
    public readonly themeService: ThemeService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkMobile.bind(this));
  }

  checkMobile() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  openSidebar() {
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }

  onMenuClick() {
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  createNewConversation() {
    this.router.navigate(['/chat']).then(() => {
      globalThis.dispatchEvent(new CustomEvent('createNewConversation'));
    });
    if (this.isMobile) {
      this.closeSidebar();
    }
  }
}
