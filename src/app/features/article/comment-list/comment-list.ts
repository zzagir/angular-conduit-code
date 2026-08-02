import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Comment } from '../../../core/models/comment.model';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-comment-list',
  imports: [RouterLink, DatePipe, Icon],
  templateUrl: './comment-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentList {
  readonly comments = input.required<Comment[]>();
  readonly currentUsername = input<string | null>(null);
  readonly deleteComment = output<number>();
}
