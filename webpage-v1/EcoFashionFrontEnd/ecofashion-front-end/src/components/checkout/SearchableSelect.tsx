import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { filterVietnameseText } from "../../utils/vietnameseUtils";

interface SearchableSelectProps<T> {
  items: T[];
  value: string;
  onChange: (value: string, item: T | null) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
  helperText?: string;
  className?: string;
}

function SearchableSelect<T>({
  items,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Chọn...",
  label,
  disabled = false,
  required = false,
  emptyMessage = "Không có dữ liệu",
  helperText,
  className = "",
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filteredItems = filterVietnameseText(items, searchQuery, getLabel);

  // Get display text for selected value
  const selectedItem = items.find((item) => getValue(item) === value);
  const displayText = selectedItem ? getLabel(selectedItem) : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when filtered items change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (item: T) => {
    onChange(getValue(item), item);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        break;
      case "Tab":
        setIsOpen(false);
        setSearchQuery("");
        break;
    }
  };

  const inputClassName = `w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
    isOpen ? "ring-2 ring-blue-500 border-transparent" : ""
  }`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayText}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
            }
          }}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-2"
          tabIndex={-1}
        >
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Helper Text */}
      {helperText && !isOpen && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}

      {/* Dropdown List */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredItems.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchQuery ? (
                <>
                  Không tìm thấy kết quả cho "<strong>{searchQuery}</strong>"
                </>
              ) : (
                emptyMessage
              )}
            </div>
          ) : (
            <ul className="py-1">
              {filteredItems.map((item, index) => {
                const itemValue = getValue(item);
                const itemLabel = getLabel(item);
                const isSelected = itemValue === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={itemValue}
                    data-index={index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : isHighlighted
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {itemLabel}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Search hint when open */}
      {isOpen && searchQuery && filteredItems.length > 0 && (
        <p className="text-xs text-blue-600 mt-1">
          Tìm thấy {filteredItems.length} kết quả
        </p>
      )}
    </div>
  );
}

export default SearchableSelect;
