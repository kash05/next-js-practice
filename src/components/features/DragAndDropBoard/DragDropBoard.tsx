"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay as DndKitDragOverlay,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { DragDropBoardProps, DropZoneConfig, DropZoneId, FieldItem, encodeDndId } from "./types";
import { useDragDropBoard } from "./useDragAndDropBoard";
import { FieldList } from "./FieldList";
import { DropZone } from "./DropZone";
import { ZoneItem } from "./DraggableItem";

const DEFAULT_ZONES: DropZoneConfig[] = [
  { id: "rowMeasures", label: "Row Measures", description: "Numeric values for rows" },
  { id: "columnMeasures", label: "Column Measures", description: "Numeric values for columns" },
  { id: "rowHeaders", label: "Row Headers", description: "Dimension labels on rows" },
  { id: "columnHeaders", label: "Column Headers", description: "Dimension labels on columns" },
];

const DROP_ZONE_IDS: DropZoneId[] = [
  "rowMeasures",
  "columnMeasures",
  "rowHeaders",
  "columnHeaders",
];

function isDropZoneId(id: string): id is DropZoneId {
  return DROP_ZONE_IDS.includes(id as DropZoneId);
}

function customCollisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    const zoneCollision = pointerCollisions.find((c) => isDropZoneId(String(c.id)));
    if (zoneCollision) return [zoneCollision];
    return pointerCollisions;
  }
  return rectIntersection(args);
}

const BOARD_H = "h-[520px] sm:h-[560px] lg:h-[580px]";

export function DragDropBoard({
  listA,
  listALabel = "Measures",
  listALoading = false,
  listB,
  listBLabel = "Dimensions",
  listBLoading = false,
  zones: zoneConfigs = DEFAULT_ZONES,
  initialState,
  onChange,
  className,
}: DragDropBoardProps) {
  const board = useDragDropBoard({ initialState, onChange });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 2 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleListItemClick = useCallback(
    (field: FieldItem, defaultZone: DropZoneId) => {
      board.addToZone(field, defaultZone);
    },
    [board],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={board.onDragStart}
      onDragOver={board.onDragOver}
      onDragEnd={board.onDragEnd}
      onDragCancel={board.onDragCancel}
    >
      <div
        className={cn(
          "flex flex-col gap-4",
          "lg:flex-row lg:items-stretch lg:gap-4",
          BOARD_H,
          className,
        )}
      >
        {/* ── Lists column --- */}
        <div className={cn("flex shrink-0 gap-3", "h-[260px] sm:h-[280px]", "lg:h-full lg:w-1/2")}>
          <FieldList
            label={listALabel}
            sourceType="list-a"
            items={listA}
            isLoading={listALoading}
            usedFieldIds={board.usedFieldIds}
            onItemClick={(field) => handleListItemClick(field, "rowMeasures")}
            onRegister={board.setListA}
            className="h-full min-w-0 flex-1"
          />
          <FieldList
            label={listBLabel}
            sourceType="list-b"
            items={listB}
            isLoading={listBLoading}
            usedFieldIds={board.usedFieldIds}
            onItemClick={(field) => handleListItemClick(field, "rowHeaders")}
            onRegister={board.setListB}
            className="h-full min-w-0 flex-1"
          />
        </div>

        {/* ── Zones column --- */}
        <div
          className={cn(
            "grid grid-cols-2 grid-rows-2 gap-3",
            "h-[260px] sm:h-[280px]",
            "lg:h-full lg:w-1/2",
          )}
        >
          {zoneConfigs.map((zoneConfig) => (
            <DropZone
              key={zoneConfig.id}
              id={zoneConfig.id}
              label={zoneConfig.label}
              description={zoneConfig.description}
              items={board.zones[zoneConfig.id]}
              isOver={board.overZoneId === zoneConfig.id}
              onRemoveItem={(dndId) => board.removeFromZone(dndId, zoneConfig.id)}
              onClear={() => board.clearZone(zoneConfig.id)}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DndKitDragOverlay
        dropAnimation={{ duration: 160, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
        style={{ zIndex: 9999 }}
      >
        {board.activeField ? (
          <ZoneItem
            field={board.activeField}
            dndId={encodeDndId({
              sourceType: "zone",
              fieldId: board.activeField.id,
              instanceKey: "overlay",
            })}
            onRemove={() => {}}
            isOverlay
          />
        ) : null}
      </DndKitDragOverlay>
    </DndContext>
  );
}

export { useDragDropBoard } from "./useDragAndDropBoard";
export type { BoardState, DropZoneId, FieldItem } from "./types";
