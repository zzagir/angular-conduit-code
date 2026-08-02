import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagList {
  readonly tags = input<string[]>([]);
}
