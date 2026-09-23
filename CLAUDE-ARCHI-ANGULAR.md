# {{PROJECT}} — Règles d'architecture Front-end Angular (OBLIGATOIRES)

> **Contrat de développement.** Toute IA ou développeur qui modifie ce projet DOIT respecter ce fichier.
> Cible : Angular 20+ — standalone components, signals, nouveau control flow.
> En cas de doute : ne pas improviser — appliquer la règle la plus stricte ci-dessous.

---

## 1. Architecture — 3 zones, dépendances à sens unique

```
src/app/
├── core/          Singletons chargés UNE fois : guards, interceptors, services
│                  transverses (auth, api, storage, notification), models globaux, layout (shell)
├── shared/        Réutilisable et "bête" : composants UI, directives, pipes, utils.
│                  AUCUN appel HTTP, AUCUNE logique métier, AUCUN service métier.
└── features/      1 dossier = 1 fonctionnalité métier, TOUJOURS lazy-loaded.
```

**Règles de dépendance :**

| Zone | Peut importer | NE PEUT JAMAIS importer |
|---|---|---|
| `features/x` | `shared`, `core`, ses propres fichiers | **une autre feature** |
| `shared` | Angular / libs UI uniquement | `core`, `features` |
| `core` | Angular / libs uniquement | `features`, `shared` (sauf exception layout) |

> Si deux features ont besoin du même code → le remonter dans `shared` (UI) ou `core` (service).

### Structure imposée d'une feature

```
features/orders/
├── orders.routes.ts                       # routes de la feature (export const ORDERS_ROUTES)
├── models/order.model.ts                  # interfaces / types de la feature
├── services/orders-api.service.ts         # data-access : SEUL endroit avec HttpClient
├── services/orders.store.ts               # état partagé de la feature (signals) — si besoin
├── pages/order-list/                      # composants "smart" (routés, injectent les services)
│   ├── order-list.component.ts
│   ├── order-list.component.html
│   └── order-list.component.scss
└── components/order-card/                 # composants "dumb" (input/output uniquement)
    └── order-card.component.ts
```

### Interdictions absolues (P0 — un manquement = travail refusé)

- ❌ `any` ou `@ts-ignore` (utiliser `unknown` + narrowing si nécessaire)
- ❌ `HttpClient` dans un composant → toujours via un service `*-api.service.ts`
- ❌ Import croisé entre features (`features/orders` → `features/users`)
- ❌ URL d'API en dur → toujours `environment.apiUrl`
- ❌ `subscribe()` sans gestion de désabonnement → `async` pipe, `toSignal()`, ou `takeUntilDestroyed()`
- ❌ Nouveau code avec `NgModule`, `*ngIf`/`*ngFor` (control flow `@if`/`@for` uniquement)
- ❌ Composant sans `ChangeDetectionStrategy.OnPush`
- ❌ Logique métier dans un template (appels de méthodes de calcul → `computed()`)
- ❌ `console.log` commité
- ❌ Secret / token / clé API dans le code source
- ❌ `innerHTML` non sanitizé, contournement de `DomSanitizer`
- ❌ Duplication de code > 10 lignes

---

## 2. Où placer chaque fichier

| Je crée… | Emplacement | Exemple |
|---|---|---|
| Un guard | `core/guards/` | `auth.guard.ts` |
| Un interceptor | `core/interceptors/` | `auth.interceptor.ts`, `error.interceptor.ts` |
| Un service transverse | `core/services/` | `auth.service.ts`, `notification.service.ts` |
| Un model global (ApiResponse…) | `core/models/` | `api-response.model.ts` |
| Le shell / header / sidebar | `core/layout/` | `shell.component.ts` |
| Un composant UI réutilisable | `shared/components/` | `data-table.component.ts` |
| Une directive / un pipe | `shared/directives/`, `shared/pipes/` | `date-fr.pipe.ts` |
| Un model de feature | `features/x/models/` | `order.model.ts` |
| Un service d'accès API | `features/x/services/` | `orders-api.service.ts` |
| Un composant routé (smart) | `features/x/pages/` | `order-list.component.ts` |
| Un composant présentation (dumb) | `features/x/components/` | `order-card.component.ts` |
| Les routes d'une feature | `features/x/x.routes.ts` | `orders.routes.ts` |

---

## 3. Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichier | kebab-case + suffixe | `order-list.component.ts`, `auth.service.ts`, `admin.guard.ts` |
| Classe | PascalCase + suffixe | `OrderListComponent`, `OrdersApiService` |
| Sélecteur | `app-` + kebab-case | `app-order-list` |
| Interface / type | PascalCase **sans** préfixe `I` | `Order`, `PaginatedResult<T>` (différent du C# !) |
| Enum | PascalCase singulier | `OrderStatus.InProgress` |
| Observable | suffixe `$` | `orders$`, `isLoading$` |
| Signal | nom simple, pas de suffixe | `orders = signal<Order[]>([])` |
| Variable / fonction | camelCase | `totalAmount`, `loadOrders()` |
| Constante globale | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Route (URL) | kebab-case pluriel | `/orders`, `/order-lines` |

**Limites de taille** : classe de composant ≤ 200 lignes · méthode ≤ 30 lignes · template complexe → extraire des sous-composants.

---

## 4. Composants — règles obligatoires

```ts
@Component({
  selector: 'app-order-list',
  imports: [OrderCardComponent, CurrencyPipe],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,   // OBLIGATOIRE
})
export class OrderListComponent {
  private readonly ordersApi = inject(OrdersApiService);   // inject(), pas de constructeur

  readonly orders = signal<Order[]>([]);
  readonly totalAmount = computed(() =>                    // dérivé = computed, pas de méthode dans le template
    this.orders().reduce((sum, o) => sum + o.total, 0));
}
```

- **Standalone** partout (défaut), jamais de `NgModule` pour du nouveau code.
- **`inject()`** au lieu de l'injection par constructeur.
- **`input()` / `output()`** (API signals) au lieu des décorateurs `@Input`/`@Output`.
- **Smart vs Dumb** : les `pages/` injectent les services et orchestrent ; les `components/` ne reçoivent que des `input()` et émettent des `output()` — zéro service métier, zéro HTTP.
- **Control flow** : `@if`, `@for` (avec `track` obligatoire), `@switch`, `@defer` pour les blocs lourds.
- Images : `NgOptimizedImage` (`ngSrc`).

---

## 5. État et données

- **Signals** pour l'état : `signal()` pour l'état local, `computed()` pour le dérivé, `update()`/`set()` pour modifier — **jamais de mutation directe** d'un objet/tableau dans un signal.
- **Un service data-access par ressource API**, seul endroit autorisé à utiliser `HttpClient` :

```ts
@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  getAll(page: number, size: number): Observable<PaginatedResult<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PaginatedResult<Order>>>(this.baseUrl, { params })
      .pipe(map(response => response.data));
  }
}
```

- **Modèles alignés sur le backend** : `ApiResponse<T>` (`success`, `message`, `data`, `timestamp`) et `PaginatedResult<T>` (`items`, `totalCount`, `page`, `pageSize`, `totalPages`) définis dans `core/models/`.
- **RxJS** : privilégier `async` pipe ou `toSignal()` ; tout `subscribe()` manuel = `takeUntilDestroyed()` ; jamais de subscribe imbriqué → `switchMap` (recherche/navigation), `exhaustMap` (soumission de formulaire), `concatMap` (ordre garanti).
- Toute liste affichée est **paginée** (le backend l'impose : réutiliser `page`/`size`/`search`/`sortBy`).

---

## 6. Routing — lazy loading obligatoire

```ts
// app.routes.ts — chaque feature est lazy
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES),
  },
];

// features/orders/orders.routes.ts
export const ORDERS_ROUTES: Routes = [
  { path: '', component: OrderListComponent, title: 'Commandes' },
  { path: ':id', component: OrderDetailComponent, title: 'Détail commande' },
];
```

- Guards **fonctionnels** (`CanActivateFn`) dans `core/guards/`.
- Propriété `title` renseignée sur chaque route.

---

## 7. HTTP, erreurs et configuration

- Interceptors **fonctionnels** (`HttpInterceptorFn`) enregistrés dans `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.
- `auth.interceptor.ts` : ajoute le header `Authorization: Bearer …`.
- `error.interceptor.ts` : mapping global — `401` → refresh/redirection login · `403` → message « accès interdit » · `404` → notification · `5xx` → message générique (jamais les détails techniques à l'utilisateur).
- Les URLs viennent de `environment.apiUrl` — `environment.development.ts` pour le dev, `environment.ts` pour la prod.

---

## 8. Formulaires

- **Reactive Forms typés** obligatoires pour tout formulaire métier (`nonNullable`, jamais de template-driven) :

```ts
readonly form = inject(NonNullableFormBuilder).group({
  email: ['', [Validators.required, Validators.email]],
  quantity: [1, [Validators.required, Validators.min(1)]],
});
```

- La validation front **duplique** les règles du validator backend (FluentValidation) — mais le serveur reste la source de vérité.
- Messages d'erreur affichés via un composant partagé (`shared/components/field-error/`), pas copiés-collés.

---

## 9. Sécurité front

- Jamais de secret dans le code ni dans les environments (une URL n'est pas un secret, une clé API oui).
- Tokens : access token en mémoire (service), refresh via le mécanisme du backend ; tout stockage passe par un unique `StorageService` dans `core/services/` — jamais de `localStorage` dispersé dans le code.
- Ne jamais désactiver la sanitization Angular ; `bypassSecurityTrust*` interdit sauf justification écrite.
- Ne jamais faire confiance aux données affichées : le contrôle d'accès réel est côté serveur — les guards front sont de l'UX, pas de la sécurité.

---

## 10. Tests

- Fichier `*.spec.ts` à côté du fichier testé.
- Structure **AAA** (Arrange / Act / Assert), `describe` = classe testée, `it` = un scénario :

```ts
describe('OrdersApiService', () => {
  it('devrait retourner la liste paginee quand l API repond', () => {
    // Arrange … // Act … // Assert …
  });
});
```

- HTTP mocké avec `provideHttpClientTesting()` + `HttpTestingController` — aucun appel réseau réel.
- Couvrir cas positifs, négatifs et limites. Les services data-access et les stores sont prioritaires.

---

## 11. Workflow imposé pour toute nouvelle feature

Implémenter **dans cet ordre**, sans sauter d'étape :

1. `features/x/models/` — interfaces alignées sur les DTOs du backend.
2. `features/x/services/x-api.service.ts` — data-access typé (+ store signals si état partagé).
3. `features/x/x.routes.ts` — routes de la feature + enregistrement lazy dans `app.routes.ts`.
4. `features/x/pages/` — composants smart (OnPush, inject, signals).
5. `features/x/components/` — composants dumb extraits (input/output).
6. Tests (`*.spec.ts`) sur le service et les composants critiques.

---

## 12. Checklist avant de terminer toute tâche

- [ ] `npx ng build` passe sans erreur ni warning
- [ ] Aucun `any`, aucun `@ts-ignore`, aucun `console.log`
- [ ] Chaque fichier est dans la bonne zone (voir carte section 2)
- [ ] Aucun import entre features ; `shared` reste sans métier ni HTTP
- [ ] Tous les composants sont `OnPush`, standalone, avec `inject()`
- [ ] Control flow `@if`/`@for` (avec `track`) — pas de `*ngIf`/`*ngFor`
- [ ] HTTP uniquement dans les services data-access, URLs via `environment.apiUrl`
- [ ] Pas de `subscribe` sans `takeUntilDestroyed()` / `async` pipe / `toSignal()`
- [ ] Listes paginées, formulaires en Reactive Forms typés avec validation
- [ ] Feature lazy-loaded, guards sur les routes protégées, `title` renseigné
- [ ] Tests écrits et verts (`npx ng test`)
