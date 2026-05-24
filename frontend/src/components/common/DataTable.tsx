import { useState, useRef, useEffect } from "react";
import {
  Settings2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  MinusSquare,
  Square,
  CircleX,
  ChevronDown,
} from "lucide-react";
import React from "react";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title?: string;
  actionButtons?: React.ReactNode;
  enableSelection?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (item: T) => string;
  renderExpandedRow?: (item: T) => React.ReactNode;
  initialSelectedIds?: string[];
}

export default function DataTable<T>({
  columns,
  data,
  title = "Danh sách dữ liệu",
  actionButtons,
  enableSelection = false,
  onSelectionChange,
  getRowId = (item: any) => item.id || '',
  renderExpandedRow,
  initialSelectedIds = [],
}: DataTableProps<T>) {
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((c) => c.id)
  );
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumnVisibility = (colId: string) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(colId)) newHidden.delete(colId);
    else newHidden.add(colId);
    setHiddenColumns(newHidden);
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === columnOrder.length - 1)
    )
      return;
    const newOrder = [...columnOrder];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [
      newOrder[swapIndex],
      newOrder[index],
    ];
    setColumnOrder(newOrder);
  };

  const visibleAndOrderedColumns = columnOrder
    .filter((id) => !hiddenColumns.has(id))
    .map((id) => columns.find((c) => c.id === id)!);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const currentPageIds = paginatedData.map(getRowId);

  const isAllCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.has(id));
  const isSomeCurrentPageSelected = currentPageIds.some(id => selectedIds.has(id));

  const handleSelectAllCurrentPage = () => {
    const newSelected = new Set(selectedIds);
    if (isAllCurrentPageSelected) {
      currentPageIds.forEach(id => newSelected.delete(id));
    } else {
      currentPageIds.forEach(id => newSelected.add(id));
    }
    updateSelection(newSelected);
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    updateSelection(newSelected);
  };

  const updateSelection = (newSet: Set<string>) => {
    setSelectedIds(newSet);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSet));
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const totalVisibleColumns = visibleAndOrderedColumns.length + (enableSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0);

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-surface border border-border rounded-2xl overflow-hidden transition-colors duration-300 relative">
      
      {/* HEADER BẢNG */}
      <div className="flex justify-between items-center p-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium animate-in fade-in">
              <span>Đã chọn {selectedIds.size}</span>
              <button
                onClick={() => updateSelection(new Set())}
                className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                title="Bỏ chọn tất cả"
              >
                <CircleX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {actionButtons}
          
          {/* NÚT TÙY CHỈNH CỘT */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
            >
              <Settings2 size={16} />
              Tùy chỉnh cột
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface border border-border shadow-lg rounded-xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
                  Hiển thị & Sắp xếp
                </div>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {columnOrder.map((colId, index) => {
                    const colDef = columns.find((c) => c.id === colId);
                    if (!colDef) return null;
                    const isHidden = hiddenColumns.has(colId);

                    return (
                      <div
                        key={colId}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleColumnVisibility(colId)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <span
                            className={`text-sm ${
                              isHidden
                                ? "text-muted-foreground line-through opacity-70"
                                : "text-foreground"
                            }`}
                          >
                            {colDef.header}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveColumn(index, "up")}
                            disabled={index === 0}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveColumn(index, "down")}
                            disabled={index === columnOrder.length - 1}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VÙNG BẢNG CUỘN */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap relative">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md text-muted-foreground border-b border-border">
            <tr>
              {renderExpandedRow && <th className="px-3 py-3.5 w-10"></th>}
              {enableSelection && (
                <th className="px-5 py-3.5 w-10">
                  <button 
                    onClick={handleSelectAllCurrentPage}
                    className="text-muted-foreground hover:text-primary flex items-center justify-center transition-colors"
                  >
                    {isAllCurrentPageSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : isSomeCurrentPageSelected ? (
                      <MinusSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
              )}
              {visibleAndOrderedColumns.map((col) => (
                <th
                  key={col.id}
                  className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleAndOrderedColumns.length + (enableSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0)}
                  className="px-5 py-8 text-center text-muted-foreground italic"
                >
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedIds.has(rowId);
                const isExpanded = expandedRows.has(rowId);

                return (
                  <React.Fragment key={rowId}>
                    {/* DÒNG DỮ LIỆU CHÍNH */}
                    <tr 
                      className={`hover:bg-muted/50 transition-colors ${isExpanded ? 'bg-muted/30' : ''}`}
                    >
                      {renderExpandedRow && (
                        <td className="px-3 py-3.5 w-10 text-center">
                          <button 
                            onClick={() => toggleRowExpansion(rowId)}
                            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        </td>
                      )}

                      {enableSelection && (
                        <td className="px-5 py-3.5 w-10">
                          <button onClick={() => handleSelectRow(rowId)} className="text-muted-foreground hover:text-primary flex items-center justify-center transition-colors">
                            {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                          </button>
                        </td>
                      )}
                      
                      {visibleAndOrderedColumns.map((col) => (
                        <td key={col.id} className="px-5 py-3.5">
                          {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] || "") : ""}
                        </td>
                      ))}
                    </tr>

                    {/* DÒNG CHI TIẾT */}
                    {isExpanded && renderExpandedRow && (
                      <tr className="bg-muted/20 border-b border-border">
                        <td colSpan={totalVisibleColumns} className="p-0">
                          <div className="animate-in slide-in-from-top-2 fade-in duration-200 p-4">
                            {renderExpandedRow(row)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER PHÂN TRANG */}
      <div className="flex items-center justify-between p-4 border-t border-border shrink-0 bg-surface">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="font-medium text-foreground">{Math.min(startIndex + pageSize, totalItems)}</span> của <span className="font-medium text-foreground">{totalItems}</span>
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-background text-sm text-foreground border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value={5}>5 dòng / trang</option>
            <option value={10}>10 dòng / trang</option>
            <option value={20}>20 dòng / trang</option>
            <option value={50}>50 dòng / trang</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || totalPages === 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[60px] text-center bg-muted py-1 px-3 rounded-lg">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}