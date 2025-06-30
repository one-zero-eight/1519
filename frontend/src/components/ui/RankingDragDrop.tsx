import type { Application } from '@/lib/types/types'
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot
} from '@hello-pangea/dnd'
import React from 'react'
import InnoButton from './shared/InnoButton'

interface RankingDragDropProps {
  availableApplications: Application[]
  rankedApplications: Application[]
  onRankingChange: (ranked: Application[]) => void
  onViewApplication: (applicationId: number) => void
  onBackToPatron?: () => void
}

const getRankColor = (rank: number) => {
  if (rank === 0 || rank === 1) return 'bg-green-100 border-green-300'
  return 'bg-gray-50 border-gray-200'
}

const RankingDragDrop: React.FC<RankingDragDropProps> = ({
  availableApplications,
  rankedApplications,
  onRankingChange,
  onViewApplication,
  onBackToPatron
}) => {
  // Обработка перемещения
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    // Перемещение внутри ranked
    if (source.droppableId === 'ranked' && destination.droppableId === 'ranked') {
      const newRanked = Array.from(rankedApplications)
      const [removed] = newRanked.splice(source.index, 1)
      newRanked.splice(destination.index, 0, removed)
      onRankingChange(newRanked)
    }
    // Перемещение из available в ranked
    else if (source.droppableId === 'available' && destination.droppableId === 'ranked') {
      const newAvailable = Array.from(availableApplications)
      const [moved] = newAvailable.splice(source.index, 1)
      const newRanked = Array.from(rankedApplications)
      newRanked.splice(destination.index, 0, moved)
      onRankingChange(newRanked)
    }
    // Перемещение из ranked в available (если нужно)
    else if (source.droppableId === 'ranked' && destination.droppableId === 'available') {
      const newRanked = Array.from(rankedApplications)
      const [moved] = newRanked.splice(source.index, 1)
      // Можно реализовать возврат в available, если нужно
      // onRankingChange(newRanked)
    }
  }

  return (
    <div className="space-y-6">
      {onBackToPatron && (
        <div className="flex justify-start">
          <InnoButton
            onClick={onBackToPatron}
            sx={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              '&:hover': { backgroundColor: '#4b5563' }
            }}
          >
            ← Back to Applications
          </InnoButton>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Ranked Applications */}
          <Droppable droppableId="ranked">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4 min-h-[300px] lg:min-h-[400px] p-2 lg:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2 lg:mb-4 text-center lg:text-start">
                  Final Ranking
                </h2>
                {rankedApplications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Drag students here to create ranking
                  </div>
                ) : (
                  rankedApplications.map((application, index) => (
                    <Draggable
                      key={application.id}
                      draggableId={application.id.toString()}
                      index={index}
                    >
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 mb-3 border rounded-lg cursor-move hover:shadow-md transition-all ${getRankColor(index)} ${snapshot.isDragging ? 'shadow-lg' : ''} touch-manipulation select-none`}
                          style={provided.draggableProps.style}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-sm font-medium text-gray-500 mr-2">
                                  #{index + 1}
                                </span>
                                {(index === 0 || index === 1) && (
                                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                    Scholarship
                                  </span>
                                )}
                              </div>
                              <h3 className="font-medium text-gray-900">{application.full_name}</h3>
                              <p className="text-sm text-gray-600">{application.email}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <InnoButton
                                onClick={() => onViewApplication(application.id)}
                                size="small"
                                sx={{ fontSize: '0.75rem', padding: '4px 12px' }}
                              >
                                View
                              </InnoButton>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {/* Available Applications */}
          <Droppable droppableId="available">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4 min-h-[300px] lg:min-h-[400px] p-2 lg:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2 lg:mb-4 text-center lg:text-start">
                  Available Students
                </h2>
                {availableApplications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No available students for ranking
                  </div>
                ) : (
                  availableApplications.map((application, index) => (
                    <Draggable
                      key={application.id}
                      draggableId={application.id.toString()}
                      index={index}
                    >
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 mb-3 border rounded-lg cursor-move hover:shadow-md transition-all bg-white border-gray-200 ${snapshot.isDragging ? 'shadow-lg' : ''} touch-manipulation select-none`}
                          style={provided.draggableProps.style}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{application.full_name}</h3>
                              <p className="text-sm text-gray-600">{application.email}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <InnoButton
                                onClick={() => onViewApplication(application.id)}
                                size="small"
                                sx={{ fontSize: '0.75rem', padding: '4px 12px' }}
                              >
                                View
                              </InnoButton>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  )
}

export default RankingDragDrop
