import type { CommunityCommentItem } from '@/lib/community/queries'

export type FlatThreadComment = CommunityCommentItem & {
  parentId?: string | null
}

export type ThreadComment = FlatThreadComment & {
  depth: number
}

function compareCreatedAt(a: FlatThreadComment, b: FlatThreadComment): number {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
}

function resolveRootId(
  comment: FlatThreadComment,
  byId: Map<string, FlatThreadComment>
): string {
  let node: FlatThreadComment | undefined = comment

  while (node?.parentId && byId.has(node.parentId)) {
    node = byId.get(node.parentId)
  }

  return node?.id ?? comment.id
}

/**
 * Orders a flat comment list into root → nested-reply groups while preserving
 * chronological order among roots and among each reply thread.
 * All descendants of a root render at depth = 1 (capped for mobile readability).
 */
export function sortThreadComments(comments: FlatThreadComment[]): ThreadComment[] {
  if (comments.length === 0) return []

  const byId = new Map(comments.map((comment) => [comment.id, comment]))

  const roots = comments
    .filter((comment) => {
      const parentId = comment.parentId ?? null
      return parentId == null || !byId.has(parentId)
    })
    .sort(compareCreatedAt)

  const rootIds = new Set(roots.map((root) => root.id))
  const repliesByRoot = new Map<string, FlatThreadComment[]>()

  for (const comment of comments) {
    if (rootIds.has(comment.id)) continue

    const rootId = resolveRootId(comment, byId)
    const bucket = repliesByRoot.get(rootId) ?? []
    bucket.push(comment)
    repliesByRoot.set(rootId, bucket)
  }

  const sorted: ThreadComment[] = []

  for (const root of roots) {
    sorted.push({ ...root, depth: 0 })

    const replies = (repliesByRoot.get(root.id) ?? []).sort(compareCreatedAt)
    for (const reply of replies) {
      sorted.push({ ...reply, depth: 1 })
    }
  }

  return sorted
}
