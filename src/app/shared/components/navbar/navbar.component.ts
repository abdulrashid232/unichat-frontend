import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterModule } from "@angular/router";
import { AuthService } from "@services/auth.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  mobileMenuOpen = false;

  constructor(private readonly authService: AuthService) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout() {
    this.authService.logout();
  }


}
