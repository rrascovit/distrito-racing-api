# 🔗 Integração Angular + Node.js API

## 📋 Configuração no Angular

### 1. Instalar Firebase no Angular

```bash
ng add @angular/fire
```

### 2. Configurar Firebase (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  firebase: {
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

### 3. Criar Interceptor HTTP

```typescript
// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Obter o token do usuário autenticado
    return from(this.getToken()).pipe(
      switchMap((token) => {
        if (token) {
          // Clonar a requisição e adicionar o header Authorization
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        return next.handle(request);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token inválido ou expirado, redirecionar para login
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}
```

### 4. Registrar Interceptor (app.config.ts ou app.module.ts)

```typescript
// Angular 17+ (app.config.ts)
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptorFn } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptorFn])
    ),
    // ... outros providers
  ]
};

// OU Angular 16 e anteriores (app.module.ts)
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

### 5. Criar Services para a API

```typescript
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  id: string;
  username?: string;
  fullname?: string;
  cpf?: string;
  phone?: string;
  // ... outros campos
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  version?: string;
  carClass?: string;
}

export interface Event {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  // ... outros campos
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // PROFILES
  getMyProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profiles/me`);
  }

  updateMyProfile(data: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/profiles/me`, data);
  }

  // CARS
  getMyCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars`);
  }

  createCar(car: Omit<Car, 'id'>): Observable<Car> {
    return this.http.post<Car>(`${this.apiUrl}/cars`, car);
  }

  updateCar(id: number, car: Partial<Car>): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/cars/${id}`, car);
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cars/${id}`);
  }

  // EVENTS
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events`);
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/upcoming`);
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // PRODUCTS
  getEventProducts(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/event/${eventId}`);
  }

  // ORDERS
  getMyOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders`, order);
  }

  updatePaymentStatus(orderId: number, isPaid: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/orders/${orderId}/payment`,
      { isPaid }
    );
  }
}
```

### 6. Criar Authentication Service

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  user
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string) {
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return await signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}
```

### 7. Exemplo de Componente

```typescript
// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService, Profile } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile?: Profile;
  loading = false;
  error?: string;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.apiService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar perfil';
        this.loading = false;
        console.error(err);
      }
    });
  }

  updateProfile(data: Partial<Profile>): void {
    this.loading = true;
    this.apiService.updateMyProfile(data).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
        alert('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        this.error = 'Erro ao atualizar perfil';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
```

## 🔒 Considerações de Segurança

1. **Nunca exponha credenciais no código**
   - Use `environment.ts` para configurações
   - Adicione `environment.prod.ts` ao `.gitignore` se necessário

2. **Validação de dados**
   - Sempre valide dados no frontend E no backend
   - Use formulários reativos do Angular com validadores

3. **Tratamento de erros**
   - Implemente tratamento global de erros
   - Mostre mensagens amigáveis aos usuários
   - Log de erros para debug

4. **Timeout de sessão**
   - Configure timeout para tokens expirados
   - Implemente refresh de tokens se necessário

## 🎯 Fluxo de Autenticação

1. **Login:**
   - Usuário faz login com Firebase Authentication
   - Firebase retorna um token JWT
   - Token é armazenado automaticamente pelo Firebase

2. **Requisições à API:**
   - Interceptor pega o token do Firebase
   - Adiciona no header `Authorization: Bearer <token>`
   - Backend valida o token com Firebase Admin SDK

3. **Autorização:**
   - Backend verifica o token
   - Extrai o `uid` do usuário
   - Usa o `uid` para buscar/criar dados no Supabase

## 📱 Exemplo de Fluxo Completo

```typescript
// 1. Usuário faz login
await this.authService.login('user@email.com', 'senha123');

// 2. Busca perfil (token enviado automaticamente)
const profile = await this.apiService.getMyProfile().toPromise();

// 3. Lista eventos
const events = await this.apiService.getEvents().toPromise();

// 4. Cria pedido
const order = await this.apiService.createOrder({
  eventId: 1,
  car: 'Honda Civic',
  carClass: 'Turismo',
  number: 77,
  days: [{ date: '2024-12-15' }],
  paymentMethod: 'pix',
  isFirstDriver: true,
  productIds: [1, 2]
}).toPromise();
```

## 🐛 Debug

### Verificar token no Angular:
```typescript
const token = await this.authService.getToken();
console.log('Token:', token);
```

### Verificar se token está sendo enviado:
```typescript
// No interceptor, adicione:
console.log('Request headers:', request.headers);
```

### Testar endpoint diretamente:
Use o arquivo `api-examples.http` do backend para testar endpoints isoladamente.

## 📚 Recursos Úteis

- [Angular HTTP Client](https://angular.io/guide/http)
- [AngularFire Auth](https://github.com/angular/angularfire/blob/master/docs/auth.md)
- [RxJS Operators](https://rxjs.dev/guide/operators)
