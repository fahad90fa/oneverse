import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  User,
  AlertCircle,
  GripVertical
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  position: number;
  created_by: string;
  assigned_user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface KanbanTaskProps {
  task: Task;
  isDragging?: boolean;
}

export const KanbanTask = ({ task, isDragging = false }: KanbanTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`glass-effect border-border p-4 cursor-pointer hover:shadow-md transition-all ${
        isDragging || isSortableDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
      }`}
      {...attributes}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
          {task.title}
        </h4>
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)} text-white border-0`}
          >
            {getPriorityIcon(task.priority)}
            <span className="ml-1 capitalize">{task.priority}</span>
          </Badge>

          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {task.assigned_user && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assigned_user.avatar_url} />
            <AvatarFallback className="text-xs">
              {task.assigned_user.full_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  );
};