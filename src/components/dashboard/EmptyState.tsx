import { CheckSquare, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  type: 'empty' | 'no-results' | 'no-active' | 'no-completed'
  onClearFilters?: () => void
}

export function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  const configs = {
    empty: {
      icon: CheckSquare,
      title: 'No todos yet',
      description: 'Get started by creating your first todo!',
      showAction: false,
    },
    'no-results': {
      icon: Search,
      title: 'No matching todos',
      description: 'Try adjusting your search or filters to find what you\'re looking for.',
      showAction: true,
    },
    'no-active': {
      icon: CheckSquare,
      title: 'All done!',
      description: 'You\'ve completed all your todos. Great job!',
      showAction: false,
    },
    'no-completed': {
      icon: Filter,
      title: 'No completed todos',
      description: 'Completed todos will appear here.',
      showAction: false,
    },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {config.description}
      </p>
      {config.showAction && onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
