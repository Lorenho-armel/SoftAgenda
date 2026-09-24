import { Routes } from '@angular/router';
import { assistanteGuard } from '../../core/guards/assistante.guard';
import { AgendaComponent } from './pages/agenda/agenda.component';
import { DemandeCreateComponent } from './pages/demande-create/demande-create.component';
import { DemandeDetailComponent } from './pages/demande-detail/demande-detail.component';
import { DemandeFileComponent } from './pages/demande-file/demande-file.component';
import { DemandeListComponent } from './pages/demande-list/demande-list.component';
import { TableauAssistanteComponent } from './pages/tableau-assistante/tableau-assistante.component';

export const DEMANDES_ROUTES: Routes = [
  { path: 'tableau', component: TableauAssistanteComponent, canActivate: [assistanteGuard], title: 'Tableau de bord' },
  { path: 'agenda', component: AgendaComponent, title: 'Agenda' },
  { path: 'file', component: DemandeFileComponent, title: 'File des demandes' },
  { path: 'nouvelle', component: DemandeCreateComponent, title: 'Nouvelle demande' },
  { path: '', component: DemandeListComponent, title: 'Demandes de rencontre' },
  { path: ':id', component: DemandeDetailComponent, title: 'Détail de la demande' },
];
