"use client";

import { useState } from "react";
import { TabPanel, Tabs, type Tab } from "@/components/Tabs";
import { AppHeader } from "@/components/AppHeader";

export default function TestTabsPage() {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [guestCount, setGuestCount] = useState(3);

  const tabs: Tab[] = [
    {
      id: "details",
      label: "Details",
      ariaLabel: "Details tab — edit event information, photos, and gallery",
    },
    {
      id: "guests",
      label: "Guests",
      ariaLabel: "Guests tab — add and manage your guest list",
      count: guestCount,
    },
    {
      id: "settings",
      label: "Settings",
      ariaLabel: "Settings tab — configure event settings",
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="mb-4 font-serif text-2xl text-[#14211D]" style={{ fontWeight: 600 }}>
            Tabs Component Test
          </h1>

          <div className="mb-8 rounded-lg border border-[#E2DFD3] bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#14211D]">Testing Instructions:</h2>
            <ul className="space-y-2 text-sm text-[#16130E]">
              <li>
                <strong>Arrow Keys:</strong> Use left/right arrows to switch tabs
              </li>
              <li>
                <strong>Home Key:</strong> Jump to first tab
              </li>
              <li>
                <strong>End Key:</strong> Jump to last tab
              </li>
              <li>
                <strong>Tab Key:</strong> Enter tab list focus, Shift+Tab for reverse
              </li>
              <li>
                <strong>Badge Count:</strong> Test guest count updates below
              </li>
            </ul>
          </div>

          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {/* Details Tab */}
            <TabPanel tabId="details" activeTab={activeTab}>
              <div className="space-y-6 py-6">
                <div>
                  <h3 className="mb-2 font-semibold text-[#14211D]">Event Details</h3>
                  <div className="space-y-3">
                    <div className="rounded border border-[#E2DFD3] p-4">
                      <label className="block text-sm text-[#16130E]">Event Name</label>
                      <input
                        type="text"
                        defaultValue="Birthday Party"
                        className="mt-1 w-full border border-[#E2DFD3] rounded px-3 py-2"
                      />
                    </div>
                    <div className="rounded border border-[#E2DFD3] p-4">
                      <label className="block text-sm text-[#16130E]">Date</label>
                      <input
                        type="date"
                        defaultValue="2026-08-15"
                        className="mt-1 w-full border border-[#E2DFD3] rounded px-3 py-2"
                      />
                    </div>
                    <div className="rounded border border-[#E2DFD3] p-4">
                      <label className="block text-sm text-[#16130E]">Description</label>
                      <textarea
                        defaultValue="Join us for a celebration!"
                        className="mt-1 w-full border border-[#E2DFD3] rounded px-3 py-2"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Guests Tab */}
            <TabPanel tabId="guests" activeTab={activeTab}>
              <div className="space-y-6 py-6">
                <div>
                  <h3 className="mb-4 font-semibold text-[#14211D]">Guest Management</h3>
                  <div className="space-y-3">
                    <div className="rounded border border-[#E2DFD3] p-4">
                      <p className="mb-3 text-sm text-[#16130E]">
                        Current guest count: <strong>{guestCount}</strong>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setGuestCount(Math.max(0, guestCount - 1))}
                          className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                        >
                          Remove Guest (-)
                        </button>
                        <button
                          onClick={() => setGuestCount(guestCount + 1)}
                          className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                        >
                          Add Guest (+)
                        </button>
                      </div>
                    </div>
                    <div className="rounded border border-[#E2DFD3] bg-[#FBF8F2] p-4">
                      <p className="text-xs text-[#16130E]">
                        Watch the "Guests" tab badge above update in real-time as you add/remove guests.
                        The badge should show the current count: <strong>{guestCount}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel tabId="settings" activeTab={activeTab}>
              <div className="space-y-6 py-6">
                <div>
                  <h3 className="mb-4 font-semibold text-[#14211D]">Event Settings</h3>
                  <div className="space-y-3">
                    <div className="rounded border border-[#E2DFD3] p-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm text-[#16130E]">Publish event</span>
                      </label>
                    </div>
                    <div className="rounded border border-[#E2DFD3] p-4">
                      <label className="block text-sm text-[#16130E]">Dress Code</label>
                      <input
                        type="text"
                        defaultValue="Casual"
                        className="mt-1 w-full border border-[#E2DFD3] rounded px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </Tabs>

          <div className="mt-8 rounded-lg border border-[#E2DFD3] bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">Current State:</h3>
            <p className="text-sm text-blue-800">
              Active Tab: <strong>{activeTab}</strong> | Guest Count: <strong>{guestCount}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
