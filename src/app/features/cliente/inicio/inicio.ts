import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, CommonModule],
  selector: 'app-inicio',
  templateUrl: './inicio.html',
})
export class Inicio {}
