import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <h2>Próximamente</h2>
      <p>Esta sección está en desarrollo</p>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #4A5568;
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    h2 { font-size: 20px; font-weight: 600; color: #7A8B9E; margin-bottom: 6px; }
    p { font-size: 14px; }
  `]
})
export class EmptyComponent {}
