"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  ariaLabel?: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  className?: string;
}

interface TabPanelProps {
  tabId: string;
  activeTab: string;
  children: ReactNode;
}

/**
 * Accessible tab panel — shows/hides based on whether tabId === activeTab.
 * Uses `hidden` attribute instead of `display: none` for better accessibility.
 */
export function TabPanel({ tabId, activeTab, children }: TabPanelProps) {
  const isActive = tabId === activeTab;
  return (
    <div
      role="tabpanel"
      id={`panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!isActive}
      className={isActive ? "animate-in fade-in duration-150" : ""}
    >
      {isActive && children}
    </div>
  );
}

/**
 * Accessible horizontal tabs component with keyboard navigation.
 * Supports Arrow Left/Right, Home, End for navigation.
 * Mobile-first: tabs stack horizontally with scroll, desktop has fixed grid.
 */
export function Tabs({ tabs, activeTab, onTabChange, children, className = "" }: TabsProps) {
  const reduceMotion = useReducedMotion();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefsMap = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  // Update indicator position when activeTab changes
  useEffect(() => {
    const activeTabButton = tabRefsMap.current[activeTab];
    if (activeTabButton && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeTabButton;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab, tabs]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowLeft":
          nextIndex = Math.max(0, currentIndex - 1);
          e.preventDefault();
          break;
        case "ArrowRight":
          nextIndex = Math.min(tabs.length - 1, currentIndex + 1);
          e.preventDefault();
          break;
        case "Home":
          nextIndex = 0;
          e.preventDefault();
          break;
        case "End":
          nextIndex = tabs.length - 1;
          e.preventDefault();
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        onTabChange(tabs[nextIndex].id);
        // Focus the newly active tab button
        tabRefsMap.current[tabs[nextIndex].id]?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, tabs, onTabChange]);

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Navegação das abas"
        className="border-b border-[#E2DFD3] bg-[#FBF8F2]"
      >
        <div className="relative flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) {
                  tabRefsMap.current[tab.id] = el;
                }
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors duration-150 sm:px-6"
              style={{
                color: activeTab === tab.id ? "#0F766E" : "rgba(22, 19, 14, 0.6)",
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#0F766E" }}
                  aria-label={`${tab.count} item(ns)`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}

          {/* Active tab indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-1 bg-[#0F766E] transition-all duration-150"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              transition: reduceMotion ? "none" : `all 150ms cubic-bezier(.22,.61,.36,1)`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Tab panels */}
      <div>{children}</div>
    </div>
  );
}
