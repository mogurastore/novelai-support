import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

  decrement(prompt: { text: string }) {
    if (/\{|\}/.test(prompt.text)) {
      prompt.text = prompt.text.replace('{', '').replace('}', '');
    } else {
      prompt.text = `[${prompt.text}]`;
    }
    this.updateInput();
  }

  increment(prompt: { text: string }) {
    if (/\[|\]/.test(prompt.text)) {
      prompt.text = prompt.text.replace('[', '').replace(']', '');
    } else {
      prompt.text = `{${prompt.text}}`;
    }
    this.updateInput();
  }

  movePrompt(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.prompts, event.previousIndex, event.currentIndex);
    this.updateInput();
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
          const dom =
            document.querySelector<HTMLInputElement>('#prompt-input-0');

          if (dom) {
            return dom.value;
          } else {
            return '';
          }
        },
      });

      const rawText: string = results[0].result;

      this.prompts = rawText
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)
        .map((t) => ({ text: t }));
    }
  }

  remove(prompt: { text: string }) {
    this.prompts = this.prompts.filter((p) => p !== prompt);
    this.updateInput();
  }

  async updateInput() {
    if (this.prompts.length) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const text = this.prompts.map((p) => p.text).join(', ') + ', ';

      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          args: [text],
          func: (text: string) => {
            const dom =
              document.querySelector<HTMLInputElement>('#prompt-input-0');

            if (dom) {
              dom.value = text;
              // @ts-expect-error NOTE: clear the interal value to force an actual change
              dom._valueTracker?.setValue('');
              dom.dispatchEvent(new Event('input', { bubbles: true }));
            }
          },
        });
      }
    }
  }
}
