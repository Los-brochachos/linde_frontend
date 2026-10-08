import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonDirective } from 'primeng/button';



@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    DrawerModule,
    ButtonDirective,
],
  selector: 'app-navbar',
  templateUrl: './navbar.html',
})
export class Navbar {}
