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
  
  export default function RothConversionOptimizer({
    enableRothConversion,
    setEnableRothConversion,
    rothStartYear,
    setRothStartYear,
    rothEndYear,
    setRothEndYear,
    rothConversionStrategy,
    setRothConversionStrategy,
  }) {
    const sensors = useSensors(useSensor(PointerSensor));
  
    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = rothConversionStrategy.findIndex((i) => i === active.id);
        const newIndex = rothConversionStrategy.findIndex((i) => i === over?.id);
        setRothConversionStrategy((items) => arrayMove(items, oldIndex, newIndex));
      }
    };
  
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
  
    return (
      <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Roth Conversion Optimizer</h2>
  
        <div className="mb-4 flex items-center space-x-3">
          <input
            type="checkbox"
            checked={enableRothConversion}
            onChange={(e) => setEnableRothConversion(e.target.checked)}
          />
          <label className="text-gray-700 font-medium">Enable Roth Conversion Optimizer</label>
        </div>
  
        {enableRothConversion && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2050"
                  className="border border-gray-300 rounded-md px-3 py-2 w-32"
                  value={rothStartYear}
                  onChange={(e) => setRothStartYear(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2060"
                  className="border border-gray-300 rounded-md px-3 py-2 w-32"
                  value={rothEndYear}
                  onChange={(e) => setRothEndYear(e.target.value)}
                />
              </div>
            </div>
  
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Roth Conversion Strategy (pre-tax investments only)
              </label>
  
              {rothConversionStrategy.length === 0 ? (
                <p className="text-gray-500 italic">No eligible pre-tax investments available.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rothConversionStrategy}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {rothConversionStrategy.map((item, index) => (
                        <SortableItem key={item} id={item} name={item} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  