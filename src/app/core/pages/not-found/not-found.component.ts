import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {}

