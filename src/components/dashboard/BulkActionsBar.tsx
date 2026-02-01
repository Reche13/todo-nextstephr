import { CheckCircle2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BulkActionsBarProps {
  selectedCount: number
  onComplete: () => void
  onDelete: () => void
  onClearSelection: () => void
}

export function BulkActionsBar({
  selectedCount,
  onComplete,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <Card className="shadow-lg border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium text-sm">
              {selectedCount} {selectedCount === 1 ? 'todo' : 'todos'} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onComplete}
              className="h-8"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="h-8"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
