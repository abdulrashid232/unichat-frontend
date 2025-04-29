import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { Environment } from 'environment/environment';
import { TokenService } from './token.service';

interface AuthResponse extends User {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = Environment.BackendUrl + '/api/auth';

  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoggedIn = signal<boolean>(false);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly tokenService: TokenService
  ) {
    this.loadStoredUserData();
  }

  get isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  get isLoggedIn$(): Observable<boolean> {
    return new Observable((observer) => {
      observer.next(this._isLoggedIn());
      return { unsubscribe: () => {} };
    });
  }

  get currentUser(): User | null {
    return this._currentUser();
  }

  private loadStoredUserData(): void {
    const token = this.tokenService.getToken();

    if (token) {
      this._isLoggedIn.set(true);

      this.getUser()
        .pipe(
          catchError((error) => {
            console.error('Token validation failed:', error);
            this.tokenService.removeToken();
            this._isLoggedIn.set(false);
            this._currentUser.set(null);
            this.currentUserSubject.next(null);
            return of(null);
          })
        )
        .subscribe((user) => {
          if (user) {
            this._currentUser.set(user);
            this._isLoggedIn.set(true);
            this.currentUserSubject.next(user);
            console.log('User session restored:', user);
          }
        });
    }
  }

  public register(
    username: string,
    email: string,
    password: string,
    university?: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, {
        username,
        email,
        password,
        university,
      })
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  public login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  public logout(): void {
    this.tokenService.removeToken();
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  public getUser(): Observable<User> {
    const token = this.tokenService.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }
    return this.http.get<User>(`${this.API_URL}/profile`).pipe(
      catchError((error) => {
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.tokenService.setToken(response.token);
    this.getUser().subscribe((user) => {
      this._currentUser.set(user);
      this.currentUserSubject.next(user);
      console.log('User logged in:', user);
    });
    this._isLoggedIn.set(true);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || errorMessage;
    }

    return throwError(() => new Error(errorMessage));
  }
}
