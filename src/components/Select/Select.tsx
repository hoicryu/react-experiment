import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import "./Select.css";

type Option = { value: string; label: string };
type Options = Option[] | (() => Promise<Option[]>);

interface SelectProps {
  value?: string | null;
  options: Options;
  onChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ value, options, onChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectDisplayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      if (typeof options === "function") {
        setLoading(true);
        try {
          const data = await (options as () => Promise<Option[]>).call(null);
          setAllOptions(data);
        } catch (error) {
          console.error("Failed to fetch options:", error);
          setAllOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setAllOptions(options as Option[]);
      }
    };

    fetchOptions();
  }, [options]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredOptions(allOptions);
    } else {
      setFilteredOptions(
        allOptions.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allOptions]);

  useEffect(() => {
    const calculateMaxWidth = () => {
      let maxWidth = 0;

      if (selectDisplayRef.current) {
        const selectDisplayWidth = selectDisplayRef.current.scrollWidth;
        maxWidth = Math.max(maxWidth, selectDisplayWidth);
      }

      if (filteredOptions.length > 0) {
        filteredOptions.forEach((option) => {
          const tempSpan = document.createElement("span");
          tempSpan.style.visibility = "hidden";
          tempSpan.style.position = "absolute";
          tempSpan.style.whiteSpace = "nowrap";
          tempSpan.innerText = option.label;
          document.body.appendChild(tempSpan);
          maxWidth = Math.max(maxWidth, tempSpan.scrollWidth);
          document.body.removeChild(tempSpan);
        });
      }

      if (containerRef.current) {
        containerRef.current.style.width = `${maxWidth}px`;
      }
    };

    calculateMaxWidth();
  }, [filteredOptions]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setDropdownOpen(true);
  };

  const handleSelectClick = () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen) {
      const selectedIndex = filteredOptions.findIndex(
        (option) => option.value === value
      );
      setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const handleOptionClick = (selectedValue: string) => {
    onChange?.(selectedValue);
    setSearchTerm("");
    setDropdownOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) return;

    if (event.key === "ArrowDown") {
      setHighlightIndex((prev) => {
        const nextIndex = (prev + 1) % filteredOptions.length;
        scrollToHighlightedOption(nextIndex);
        return nextIndex;
      });
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setHighlightIndex((prev) => {
        const nextIndex = prev === 0 ? filteredOptions.length - 1 : prev - 1;
        scrollToHighlightedOption(nextIndex);
        return nextIndex;
      });
      event.preventDefault();
    } else if (event.key === "Enter" && highlightIndex >= 0) {
      handleOptionClick(filteredOptions[highlightIndex].value);
      event.preventDefault();
    } else if (event.key === "Escape") {
      setDropdownOpen(false);
      setHighlightIndex(-1);
    }
  };

  const scrollToHighlightedOption = (index: number) => {
    if (optionsListRef.current) {
      const option = optionsListRef.current.children[index] as HTMLElement;
      if (option) {
        option.scrollIntoView({ block: "nearest" });
      }
    }
  };

  const handleClickOutside = (event: MouseEvent<Document, MouseEvent>) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
      setSearchTerm("");
      setHighlightIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener(
      "mousedown",
      handleClickOutside as unknown as EventListener
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside as unknown as EventListener
      );
  }, []);

  useEffect(() => {
    if (dropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const adjustDropdownPosition = () => {
      if (containerRef.current && selectDisplayRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const selectHeight = selectDisplayRef.current.offsetHeight;
        const dropdownHeight = optionsListRef.current?.offsetHeight || 0;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          containerRef.current.classList.add("above");
        } else {
          containerRef.current.classList.remove("above");
        }
      }
    };

    if (dropdownOpen) {
      adjustDropdownPosition();
    }
  }, [dropdownOpen, filteredOptions]);

  return (
    <div className="select-container" ref={containerRef}>
      <div
        className={`select-display ${dropdownOpen ? "open" : ""} ${
          document.activeElement === selectDisplayRef.current ? "focus" : ""
        }`}
        onClick={handleSelectClick}
        role="combobox"
        aria-expanded={dropdownOpen}
        aria-controls="options-list"
        ref={selectDisplayRef}
      >
        {value
          ? allOptions.find((option) => option.value === value)?.label
          : "Select..."}
      </div>
      {dropdownOpen && (
        <div className="options-list" id="options-list">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="search-input"
            placeholder="Search..."
            ref={inputRef}
          />
          <ul ref={optionsListRef}>
            {loading ? (
              <li>Loading...</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`${
                    highlightIndex === index ? "highlighted" : ""
                  } ${value === option.value ? "selected" : ""}`}
                  onClick={() => handleOptionClick(option.value)}
                  role="option"
                  aria-selected={highlightIndex === index}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export { Select };
