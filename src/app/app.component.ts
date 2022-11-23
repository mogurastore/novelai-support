import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  prompts: { text: string }[] = [];

  ngOnInit() {
    this.readFromPage();
  }

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

  async readFromPage() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const dom: any = document.querySelector('#prompt-input-0');

          if (dom) {
            return dom.value;
          }
        },
      });

      const rawText: string = results[0].result || '';

      this.prompts = rawText
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)
        .map((t) => ({ text: t }));
    }
  }

  remove(prompt: { text: string }) {
    this.prompts = this.prompts.filter((p) => p !== prompt);
  }
}
