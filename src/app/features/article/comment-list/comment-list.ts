import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comment-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './comment-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentList {
  readonly comments = input.required<Comment[]>();
  readonly currentUsername = input<string | null>(null);
  readonly deleteComment = output<number>();
}
