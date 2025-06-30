import type { Application } from '@/lib/types/types'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useEffect } from 'react'
import InnoButton from './shared/InnoButton'

interface RankingDragDropProps {
  availableApplications: Application[]
  rankedApplications: Application[]
  onRankingChange: (ranked: Application[]) => void
  onViewApplication: (applicationId: number) => void
  onBackToPatron?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

interface SortableItemProps {
  application: Application
  index?: number
  isRanked?: boolean
  onView?: () => void
}

const SortableItem = React.memo<SortableItemProps>(
  ({ application, index, isRanked = false, onView }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: application.id.toString()
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
      willChange: 'transform'
    }

    const getRankColor = (rank: number) => {
      if (rank === 0 || rank === 1) return 'bg-green-100 border-green-300'
      return 'bg-gray-50 border-gray-200'
    }

    // Prevent drag when clicking on buttons
    const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
      e.stopPropagation()
      e.preventDefault()
      if (callback) callback()
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
        p-4 mb-3 border rounded-lg cursor-move hover:shadow-md transition-all
        ${isRanked && index !== undefined ? getRankColor(index) : 'bg-white border-gray-200'}
        ${isDragging ? 'shadow-lg' : ''}
        touch-manipulation select-none
      `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isRanked && index !== undefined && (
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                {(index === 0 || index === 1) && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    Scholarship
                  </span>
                )}
              </div>
            )}
            <h3 className="font-medium text-gray-900">{application.full_name}</h3>
            <p className="text-sm text-gray-600">{application.email}</p>
          </div>
          <div className="flex gap-2 ml-4">
            {onView && (
              <InnoButton
                onClick={(e) => handleButtonClick(e, onView)}
                size="small"
                sx={{ fontSize: '0.75rem', padding: '4px 12px' }}
              >
                View
              </InnoButton>
            )}
          </div>
        </div>
      </div>
    )
  }
)

export const RankingDragDrop: React.FC<RankingDragDropProps> = ({
  availableApplications,
  rankedApplications,
  onRankingChange,
  onViewApplication,
  onBackToPatron,
  onDragStart,
  onDragEnd
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 3
      }
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    // Предотвращаем зум на мобильных устройствах
    if (event.active) {
      document.body.style.touchAction = 'none'
    }
    onDragStart?.()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    // Восстанавливаем нормальное поведение touch
    document.body.style.touchAction = ''

    const { active, over } = event

    if (!over || active.id === over.id) {
      onDragEnd?.()
      return
    }

    const activeId = parseInt(active.id as string)
    const overId = parseInt(over.id as string)

    const activeApp =
      availableApplications.find((app) => app.id === activeId) ||
      rankedApplications.find((app) => app.id === activeId)

    if (!activeApp) {
      onDragEnd?.()
      return
    }

    // If dragging from available to ranked
    if (
      availableApplications.find((app) => app.id === activeId) &&
      rankedApplications.find((app) => app.id === overId)
    ) {
      const newRanked = [...rankedApplications]
      const insertIndex = newRanked.findIndex((app) => app.id === overId)
      newRanked.splice(insertIndex, 0, activeApp)
      onRankingChange(newRanked)
    }
    // If dragging within ranked list
    else if (
      rankedApplications.find((app) => app.id === activeId) &&
      rankedApplications.find((app) => app.id === overId)
    ) {
      const oldIndex = rankedApplications.findIndex((app) => app.id === activeId)
      const newIndex = rankedApplications.findIndex((app) => app.id === overId)
      const newRanked = arrayMove(rankedApplications, oldIndex, newIndex)
      onRankingChange(newRanked)
    }
    // If dragging from available to empty ranked area
    else if (
      availableApplications.find((app) => app.id === activeId) &&
      !rankedApplications.find((app) => app.id === overId)
    ) {
      const newRanked = [...rankedApplications, activeApp]
      onRankingChange(newRanked)
    }

    onDragEnd?.()
  }

  useEffect(() => {
    return () => {
      document.body.style.touchAction = ''
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Back button */}
      {onBackToPatron && (
        <div className="flex justify-start">
          <InnoButton
            onClick={onBackToPatron}
            sx={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              '&:hover': {
                backgroundColor: '#4b5563'
              }
            }}
          >
            ← Back to Applications
          </InnoButton>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Ranked Applications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Ranking</h2>
            <div className="min-h-[300px] lg:min-h-[400px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 touch-manipulation select-none">
              <SortableContext
                items={rankedApplications.map((app) => app.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {rankedApplications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Drag students here to create ranking
                  </div>
                ) : (
                  rankedApplications.map((application, index) => (
                    <SortableItem
                      key={application.id}
                      application={application}
                      index={index}
                      isRanked={true}
                      onView={() => onViewApplication(application.id)}
                    />
                  ))
                )}
              </SortableContext>
            </div>
          </div>

          {/* Available Applications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Students</h2>
            <div className="min-h-[300px] lg:min-h-[400px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 touch-manipulation select-none">
              <SortableContext
                items={availableApplications.map((app) => app.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {availableApplications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No available students for ranking
                  </div>
                ) : (
                  availableApplications.map((application) => (
                    <SortableItem
                      key={application.id}
                      application={application}
                      onView={() => onViewApplication(application.id)}
                    />
                  ))
                )}
              </SortableContext>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}

export default RankingDragDrop
