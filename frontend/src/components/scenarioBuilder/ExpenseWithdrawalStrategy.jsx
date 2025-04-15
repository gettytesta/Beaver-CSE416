import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, name, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 bg-white border rounded px-4 py-2 shadow-sm cursor-move"
    >
      <span className="text-sm font-medium w-6">{index + 1}.</span>
      <div className="flex-1 text-gray-800">{name}</div>
      <div className="text-gray-400 text-xs select-none">⠿</div>
    </div>
  );
}

export default function ExpenseWithdrawalStrategy({ withdrawalStrategy, setWithdrawalStrategy }) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = withdrawalStrategy.findIndex((i) => i.id === active.id);
      const newIndex = withdrawalStrategy.findIndex((i) => i.id === over?.id);
      setWithdrawalStrategy((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Expense Withdrawal Strategy</h2>

      {withdrawalStrategy.length === 0 ? (
        <p className="text-sm italic text-gray-500">No investments available.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={withdrawalStrategy.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {withdrawalStrategy.map((item, index) => (
                <SortableItem key={item.id} id={item.id} name={item.name} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
