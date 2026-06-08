import { z } from 'zod'

import { KARMA_RULES } from '@/lib/community/constants'

export const MIN_COMMENT_BODY_CHARS = KARMA_RULES.REVIEW_GIVEN.minReviewChars

export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post reference.'),
  body: z
    .string()
    .trim()
    .min(
      MIN_COMMENT_BODY_CHARS,
      `Constructive or silent — comments must be at least ${MIN_COMMENT_BODY_CHARS} characters to earn Karma.`
    ),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

export type UpvoteTargetType = 'post' | 'comment'

export const upvoteTargetSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['post', 'comment']),
})

export type UpvoteTargetInput = z.infer<typeof upvoteTargetSchema>
