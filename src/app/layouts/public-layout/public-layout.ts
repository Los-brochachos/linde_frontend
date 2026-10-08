import { Component } from '@angular/core';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet,Navbar,Footer],
  selector: 'app-public-layout',
  templateUrl: './public-layout.html',
})
export class PublicLayout {}
