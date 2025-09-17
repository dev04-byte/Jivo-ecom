import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SAPItemDetail {
  id: number;
  itemcode: string;
  itemname: string;
  itemgroup?: string;
  type?: string;
  variety?: string;
  subgroup?: string;
  brand?: string;
  uom?: string;
  taxrate?: number;
  unitsize?: string;
  is_litre?: boolean;
  case_pack?: number;
  basic_rate?: number;
  landing_rate?: number;
  mrp?: number;
  supplier_price?: number;
}

interface SearchableSAPItemInputProps {
  value: string;
  onChange: (value: string, sapItem?: SAPItemDetail) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSAPItemInput({
  value,
  onChange,
  placeholder = "Search SAP item code or name...",
  className
}: SearchableSAPItemInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement[]>([]);

  // Use custom debounce hook for smoother search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch SAP items from items table with better caching and error handling
  const { data: itemsResponse, isLoading: itemsLoading, error, refetch } = useQuery({
    queryKey: ['sap-items', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        return [];
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`/api/items?search=${encodeURIComponent(debouncedSearchQuery)}`, {
          credentials: "include",
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment.');
          }
          throw new Error(`Search failed (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Search timed out. Please try again.');
        }
        throw error;
      }
    },
    enabled: debouncedSearchQuery.length >= 2 && !isSelecting && open,
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Retry up to 2 times for network errors, but not for 4xx client errors
      if (failureCount < 2 && !error.message.includes('4')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000)
  });

  const sapItems = Array.isArray(itemsResponse) ? itemsResponse : [];

  // Function to highlight matching terms
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;

    const words = query.toLowerCase().split(/\s+/);
    let highlightedText = text;

    words.forEach(word => {
      if (word.length > 1) {
        const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>');
      }
    });

    return highlightedText;
  };

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelectSAPItem = async (selectedItem: SAPItemDetail) => {
    setIsSelecting(true);
    setInputValue(selectedItem.itemcode); // Show SAP itemcode in input
    setSelectedIndex(-1);
    setOpen(false);

    // Send SAP itemcode as first parameter and selectedItem as second parameter
    onChange(selectedItem.itemcode, selectedItem);
    setIsSelecting(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    setSearchQuery(newValue);
    setSelectedIndex(-1);
    setOpen(newValue.length >= 1);
    onChange(newValue);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < sapItems.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < sapItems.length) {
          handleSelectSAPItem(sapItems[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      {/* Simple Input Field */}
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pr-10", className)}
        onFocus={() => setOpen(inputValue.length >= 1)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck="false"
      />

      {/* Icons */}
      <div className="absolute right-0 top-0 h-full flex items-center pr-3">
        {isSelecting || itemsLoading ? (
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Suggestions below input */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Search Status */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {itemsLoading ? "Searching SAP items..." :
                 error ? "Search error" :
                 sapItems.length > 0 ? `${sapItems.length} SAP item${sapItems.length === 1 ? '' : 's'} found` :
                 searchQuery.length >= 2 ? "No SAP items found" : "Start typing to search SAP items"}
              </span>
              {searchQuery.length >= 2 && (
                <span className="text-xs text-gray-400">
                  {searchQuery.length < 2 ? 'Min 2 chars' : '↑↓ navigate, ↵ select'}
                </span>
              )}
            </div>
          </div>

          {/* Loading State */}
          {itemsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">Searching SAP items...</span>
            </div>
          )}

          {/* Enhanced Error State */}
          {error && (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">Search Error</span>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  {error.message || 'Failed to search SAP items. Please try again.'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {!itemsLoading && !error && sapItems.length === 0 && searchQuery.length >= 2 && (
            <div className="p-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm font-medium">No SAP items found</div>
              <div className="text-xs mt-1">Try different search terms</div>
            </div>
          )}

          {/* Search Results */}
          {sapItems.length > 0 && (
            <div className="py-2">
              {sapItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isCurrentValue = inputValue === item.itemcode;

                return (
                  <div
                    key={`item-${item.id}-${index}`}
                    ref={el => { if (el) optionsRef.current[index] = el; }}
                    className={cn(
                      "px-4 py-3 cursor-pointer border-l-2 transition-all duration-150",
                      isSelected
                        ? "bg-blue-50 border-l-blue-500 text-blue-900"
                        : isCurrentValue
                        ? "bg-green-50 border-l-green-500 text-green-900"
                        : "border-l-transparent hover:bg-gray-50"
                    )}
                    onClick={() => handleSelectSAPItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "font-medium truncate",
                            isSelected ? "text-blue-700" : "text-gray-900"
                          )}
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(item.itemname, debouncedSearchQuery)
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          <div>Code: {highlightMatch(item.itemcode, debouncedSearchQuery)}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.itemgroup && <span className="bg-gray-100 px-1 rounded text-xs">{item.itemgroup}</span>}
                            {item.brand && <span className="bg-blue-100 px-1 rounded text-xs">{item.brand}</span>}
                            {item.taxrate && <span className="bg-green-100 px-1 rounded text-xs">Tax: {item.taxrate}%</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        {isCurrentValue && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                        {isSelected && !isCurrentValue && (
                          <ChevronDown className="h-4 w-4 text-blue-600 rotate-[-90deg]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Instruction Footer */}
          {sapItems.length > 0 && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
              Use arrow keys to navigate • Enter to select • Esc to close
            </div>
          )}
        </div>
      )}
    </div>
  );
}