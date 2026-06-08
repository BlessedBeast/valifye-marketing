/**
 * Lightweight markdown renderer for community post/comment bodies.
 */
function renderWithBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

type MarkdownBodyProps = {
  content: string
  className?: string
}

export function MarkdownBody({ content, className }: MarkdownBodyProps) {
  const lines = content.split('\n')

  return (
    <div className={className}>
      {lines.map((rawLine, lineIdx) => {
        const line = rawLine.trimEnd()
        const trimmed = line.trim()

        if (trimmed === '') {
          return <div key={lineIdx} className="h-2" />
        }
        if (trimmed === '---') {
          return <hr key={lineIdx} className="my-4 border-border" />
        }
        if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
          const heading = line.replace(/^#+\s*/, '').trim()
          return (
            <h3
              key={lineIdx}
              className="mt-4 mb-2 text-sm font-bold uppercase tracking-wider text-primary"
            >
              {renderWithBold(heading)}
            </h3>
          )
        }
        const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)$/)
        if (bulletMatch) {
          const bulletContent = bulletMatch[1] ?? trimmed
          return (
            <div key={lineIdx} className="mb-1 ml-4 flex gap-2">
              <span className="shrink-0 text-primary">›</span>
              <span className="leading-relaxed text-muted-foreground">
                {renderWithBold(bulletContent)}
              </span>
            </div>
          )
        }
        return (
          <p key={lineIdx} className="mb-2 leading-relaxed text-foreground/90">
            {renderWithBold(line)}
          </p>
        )
      })}
    </div>
  )
}
