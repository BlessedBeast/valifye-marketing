import type { CommunityCommentItem } from '@/lib/community/queries'

export type FlatThreadComment = CommunityCommentItem & {
  parentId?: string | null
}

export type ThreadComment = FlatThreadComment & {
  depth: number
}

export type CommentTreeNode = ThreadComment & {
  children: CommentTreeNode[]
}

function compareCreatedAt(a: FlatThreadComment, b: FlatThreadComment): number {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
}

/**
 * Builds a nested comment tree with true depth from parent_id chains.
 * Orphan replies (missing parent in the set) surface as roots.
 */
export function buildCommentTree(comments: FlatThreadComment[]): CommentTreeNode[] {
  if (comments.length === 0) return []

  const nodes = new Map<string, CommentTreeNode>(
    comments.map((comment) => [
      comment.id,
      {
        ...comment,
        parentId: comment.parentId ?? null,
        depth: 0,
        children: [],
      },
    ])
  )

  const roots: CommentTreeNode[] = []

  for (const comment of comments) {
    const node = nodes.get(comment.id)
    if (!node) continue

    const parentId = comment.parentId ?? null
    const parent = parentId ? nodes.get(parentId) : undefined

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  function assignDepth(node: CommentTreeNode, depth: number): void {
    node.depth = depth
    node.children.sort(compareCreatedAt)
    for (const child of node.children) {
      assignDepth(child, depth + 1)
    }
  }

  roots.sort(compareCreatedAt)
  for (const root of roots) {
    assignDepth(root, 0)
  }

  return roots
}

/** @deprecated Prefer buildCommentTree for threaded UI. */
export function sortThreadComments(comments: FlatThreadComment[]): ThreadComment[] {
  const flattened: ThreadComment[] = []

  function walk(node: CommentTreeNode): void {
    flattened.push(node)
    for (const child of node.children) {
      walk(child)
    }
  }

  for (const root of buildCommentTree(comments)) {
    walk(root)
  }

  return flattened
}
