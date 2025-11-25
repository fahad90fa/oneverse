import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanTask } from "./KanbanTask";
import { Task } from "./KanbanBoard";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export const KanbanColumn = ({ id, title, color, tasks }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`glass-effect border-border rounded-lg p-4 min-h-[500px] transition-colors ${
        isOver ? 'bg-primary/5 border-primary/50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <KanbanTask key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">No tasks in {title.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
};