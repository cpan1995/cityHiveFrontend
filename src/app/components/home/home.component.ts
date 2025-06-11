import { Component, OnInit, signal } from '@angular/core';
import { AuthService, IUser } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  
  constructor(private authService: AuthService, private router: Router) {}

  user: IUser = {
    username: '',
    _id: ''
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()){
      this.router.navigate(['login']);
    } else 
    {
      this.user = this.authService.currentUser()
    }
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

}
