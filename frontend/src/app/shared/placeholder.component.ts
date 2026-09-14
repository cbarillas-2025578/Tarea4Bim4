import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-content">
      <div class="placeholder-inner">
        <span class="placeholder-icon">{{ icon }}</span>
        <h2>{{ title }}</h2>
        <p>Próximamente disponible</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .placeholder-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 32px;
    }
    .placeholder-inner {
      text-align: center;
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .placeholder-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 8px;
    }
    p {
      font-size: 14px;
      color: #4A5568;
    }
  `]
})
export class PlaceholderComponent {
  @Input() title = '';
  @Input() icon = '📄';
}
