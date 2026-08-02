import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListErrors {
  readonly errors = input<Record<string, string[]> | null>(null);

  protected readonly Object = Object;
}
