import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Header],
  templateUrl: './dashboard-layout.html',

})
export class DashboardLayout {}