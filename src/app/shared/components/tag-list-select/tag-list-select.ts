import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-tag-list-select',
  templateUrl: './tag-list-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListSelect {
  readonly tags = input<string[]>([]);
  readonly selectedTag = input<string | null>(null);
  readonly tagSelected = output<string>();
}
