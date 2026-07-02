"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  BoardState,
  DropZoneId,
  FieldItem,
  encodeDndId,
  decodeDndId,
} from "./types";

const DROP_ZONE_IDS: DropZoneId[] = [
  "rowMeasures",
  "columnMeasures",
  "rowHeaders",
  "columnHeaders",
];

function isDropZoneId(id: string): id is DropZoneId {
  return DROP_ZONE_IDS.includes(id as DropZoneId);
}

function makeInstanceKey(): string {
  return Math.random().toString(36).slice(2, 8);
}

function makeZoneItem(field: FieldItem, zoneId: DropZoneId): ZoneItem {
  return {
    ...field,
    dndId: encodeDndId({
      sourceType: "zone",
      zoneId,
      fieldId: field.id,
      instanceKey: makeInstanceKey(),
    }),
  };
}

export type ZoneItem = FieldItem & { dndId: string };
export type ZoneMap = Record<DropZoneId, ZoneItem[]>;

interface UseDragDropBoardOptions {
  initialState?: Partial<BoardState>;
  onChange?: (state: BoardState) => void;
}

export function useDragDropBoard({
  initialState,
  onChange,
}: UseDragDropBoardOptions) {
  const [zones, setZones] = useState<ZoneMap>(() => {
    const init: ZoneMap = {
      rowMeasures: [],
      columnMeasures: [],
      rowHeaders: [],
      columnHeaders: [],
    };
    if (!initialState) return init;
    for (const zoneId of DROP_ZONE_IDS) {
      const fields = initialState[zoneId] ?? [];
      init[zoneId] = fields.map((f) => makeZoneItem(f, zoneId));
    }
    return init;
  });

  const [activeDndId, setActiveDndId] = useState<UniqueIdentifier | null>(null);
  const [activeField, setActiveField] = useState<FieldItem | null>(null);
  const [overZoneId, setOverZoneId] = useState<DropZoneId | null>(null);

  // Refs for list items — avoids re-renders when lists update
  const listARef = useRef<FieldItem[]>([]);
  const listBRef = useRef<FieldItem[]>([]);

  const setListA = useCallback((items: FieldItem[]) => {
    listARef.current = items;
  }, []);
  const setListB = useCallback((items: FieldItem[]) => {
    listBRef.current = items;
  }, []);

  // ── usedFieldIds — which fields are already in any zone ───────────────────
  const usedFieldIds = useMemo<Set<string>>(() => {
    const s = new Set<string>();
    for (const zoneId of DROP_ZONE_IDS)
      zones[zoneId].forEach((i) => s.add(i.id));
    return s;
  }, [zones]);

  const pendingEmit = useRef<ZoneMap | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!pendingEmit.current) return;
    const next = pendingEmit.current;
    pendingEmit.current = null;
    onChangeRef.current?.({
      rowMeasures: next.rowMeasures.map(({ dndId: _, ...f }) => f),
      columnMeasures: next.columnMeasures.map(({ dndId: _, ...f }) => f),
      rowHeaders: next.rowHeaders.map(({ dndId: _, ...f }) => f),
      columnHeaders: next.columnHeaders.map(({ dndId: _, ...f }) => f),
    });
  }, [zones]);

  const scheduleEmit = useCallback((next: ZoneMap) => {
    pendingEmit.current = next;
  }, []);

  // ── Field resolution helpers ───────────────────────────────────────────────
  function resolveField(
    dndId: UniqueIdentifier,
    currentZones: ZoneMap,
  ): FieldItem | null {
    const decoded = decodeDndId(String(dndId));
    if (!decoded) return null;
    if (decoded.sourceType === "list-a")
      return listARef.current.find((f) => f.id === decoded.fieldId) ?? null;
    if (decoded.sourceType === "list-b")
      return listBRef.current.find((f) => f.id === decoded.fieldId) ?? null;
    for (const zoneId of DROP_ZONE_IDS) {
      const found = currentZones[zoneId].find((z) => z.dndId === String(dndId));
      if (found) return found;
    }
    return null;
  }

  function findItemZone(
    dndId: string,
    currentZones: ZoneMap,
  ): DropZoneId | null {
    for (const zoneId of DROP_ZONE_IDS) {
      if (currentZones[zoneId].some((z) => z.dndId === dndId)) return zoneId;
    }
    return null;
  }

  // ── Drag events ───────────────────────────────────────────────────────────
  function onDragStart({ active }: DragStartEvent) {
    setActiveDndId(active.id);
    setZones((prev) => {
      setActiveField(resolveField(active.id, prev));
      return prev;
    });
  }

  function onDragOver({ active: _active, over }: DragOverEvent) {
    if (!over) {
      setOverZoneId(null);
      return;
    }
    const overId = String(over.id);
    if (isDropZoneId(overId)) {
      setOverZoneId(overId);
      return;
    }
    const decoded = decodeDndId(overId);
    if (decoded?.zoneId) setOverZoneId(decoded.zoneId);
    else setOverZoneId(null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveDndId(null);
    setActiveField(null);
    setOverZoneId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeParsed = decodeDndId(activeId);
    if (!activeParsed) return;

    let targetZone: DropZoneId | null = null;
    if (isDropZoneId(overId)) {
      targetZone = overId;
    } else {
      const op = decodeDndId(overId);
      targetZone = op?.zoneId ?? null;
    }
    if (!targetZone) return;

    setZones((prev) => {
      const next: ZoneMap = {
        rowMeasures: [...prev.rowMeasures],
        columnMeasures: [...prev.columnMeasures],
        rowHeaders: [...prev.rowHeaders],
        columnHeaders: [...prev.columnHeaders],
      };

      // ── List → zone ────────────────────────────────────────────────────
      if (
        activeParsed.sourceType === "list-a" ||
        activeParsed.sourceType === "list-b"
      ) {
        const list =
          activeParsed.sourceType === "list-a"
            ? listARef.current
            : listBRef.current;
        const field = list.find((f) => f.id === activeParsed.fieldId);
        if (!field) return prev;
        const alreadyUsed = DROP_ZONE_IDS.some((z) =>
          next[z].some((i) => i.id === field.id),
        );
        if (alreadyUsed) return prev;

        const newItem = makeZoneItem(field, targetZone);
        const overParsed = decodeDndId(overId);
        const targetItems = next[targetZone];
        if (overParsed?.zoneId === targetZone) {
          const idx = targetItems.findIndex((z) => z.dndId === overId);
          if (idx !== -1) targetItems.splice(idx, 0, newItem);
          else targetItems.push(newItem);
        } else {
          targetItems.push(newItem);
        }
        scheduleEmit(next);
        return next;
      }

      // ── Zone → zone (reorder or cross-zone move) ──────────────────────
      if (activeParsed.sourceType === "zone") {
        const sourceZone = activeParsed.zoneId ?? findItemZone(activeId, prev);
        if (!sourceZone) return prev;

        const sourceItems = next[sourceZone];
        const activeIndex = sourceItems.findIndex((z) => z.dndId === activeId);
        if (activeIndex === -1) return prev;

        if (sourceZone === targetZone) {
          // Reorder within same zone
          const overParsed = decodeDndId(overId);
          if (overParsed?.zoneId === targetZone) {
            const overIndex = sourceItems.findIndex((z) => z.dndId === overId);
            if (overIndex !== -1)
              next[sourceZone] = arrayMove(sourceItems, activeIndex, overIndex);
          }
        } else {
          // Move to different zone
          const [movedItem] = sourceItems.splice(activeIndex, 1);
          next[sourceZone] = sourceItems;
          const updatedItem: ZoneItem = {
            ...movedItem,
            dndId: encodeDndId({
              sourceType: "zone",
              zoneId: targetZone,
              fieldId: movedItem.id,
              instanceKey: makeInstanceKey(),
            }),
          };
          const targetItems = next[targetZone];
          const overParsed = decodeDndId(overId);
          if (overParsed?.zoneId === targetZone) {
            const idx = targetItems.findIndex((z) => z.dndId === overId);
            if (idx !== -1) targetItems.splice(idx, 0, updatedItem);
            else targetItems.push(updatedItem);
          } else {
            targetItems.push(updatedItem);
          }
        }
        scheduleEmit(next);
        return next;
      }

      return prev;
    });
  }

  function onDragCancel() {
    setActiveDndId(null);
    setActiveField(null);
    setOverZoneId(null);
  }

  const addToZone = useCallback(
    (field: FieldItem, zoneId: DropZoneId) => {
      setZones((prev) => {
        const alreadyUsed = DROP_ZONE_IDS.some((z) =>
          prev[z].some((i) => i.id === field.id),
        );
        if (alreadyUsed) return prev;
        const next = {
          ...prev,
          [zoneId]: [...prev[zoneId], makeZoneItem(field, zoneId)],
        };
        scheduleEmit(next);
        return next;
      });
    },
    [scheduleEmit],
  );

  const removeFromZone = useCallback(
    (dndId: string, zoneId: DropZoneId) => {
      setZones((prev) => {
        const next = {
          ...prev,
          [zoneId]: prev[zoneId].filter((z) => z.dndId !== dndId),
        };
        scheduleEmit(next);
        return next;
      });
    },
    [scheduleEmit],
  );

  const clearZone = useCallback(
    (zoneId: DropZoneId) => {
      setZones((prev) => {
        const next = { ...prev, [zoneId]: [] };
        scheduleEmit(next);
        return next;
      });
    },
    [scheduleEmit],
  );

  const getBoardState = useCallback(
    (): BoardState => ({
      rowMeasures: zones.rowMeasures.map(({ dndId: _, ...f }) => f),
      columnMeasures: zones.columnMeasures.map(({ dndId: _, ...f }) => f),
      rowHeaders: zones.rowHeaders.map(({ dndId: _, ...f }) => f),
      columnHeaders: zones.columnHeaders.map(({ dndId: _, ...f }) => f),
    }),
    [zones],
  );

  return {
    zones,
    activeDndId,
    activeField,
    overZoneId,
    usedFieldIds,
    setListA,
    setListB,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    addToZone,
    removeFromZone,
    clearZone,
    getBoardState,
  };
}
