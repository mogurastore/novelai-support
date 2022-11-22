import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  prompts: { text: string }[] = [];
  rawText = '';

  copyToClipboard() {
    if (this.prompts.length > 0) {
      const text = this.prompts.map((p) => p.text).join(', ');

      navigator.clipboard.writeText(`${text}, `);
    }
  }

  decrement(prompt: { text: string }) {
    if (/\{|\}/.test(prompt.text)) {
      prompt.text = prompt.text.replace('{', '').replace('}', '');
    } else {
      prompt.text = `[${prompt.text}]`;
    }
  }

  increment(prompt: { text: string }) {
    if (/\[|\]/.test(prompt.text)) {
      prompt.text = prompt.text.replace('[', '').replace(']', '');
    } else {
      prompt.text = `{${prompt.text}}`;
    }
  }

  onSubmit() {
    this.prompts = this.rawText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)
      .map((t) => ({ text: t }));
  }

  remove(prompt: { text: string }) {
    this.prompts = this.prompts.filter((p) => p !== prompt);
  }
}
