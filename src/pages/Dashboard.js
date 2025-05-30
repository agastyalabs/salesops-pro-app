import React from "react";
import GeminiInsightsPanel from "../components/GeminiInsightsPanel";
import GeminiSmartSearchPanel from "../components/GeminiSmartSearchPanel";
import GeminiActivitySummaryPanel from "../components/GeminiActivitySummaryPanel";

const statCards = [
  { label: "Total Leads", value: 0, color: "bg-blue-500" },
  { label: "Open Deals", value: 0, color: "bg-green-500" },
  { label: "Total Contacts", value: 0, color: "bg-indigo-500" },
  { label: "Active Tasks", value: 0, color: "bg-teal-500" },
  { label: "Upcoming Meetings", value: 0, color: "bg-pink-500" }
];

const Dashboard = ({ userProfile }) => (
  <div>
    {/* AI Panels */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <GeminiInsightsPanel />
      <GeminiSmartSearchPanel />
      <GeminiActivitySummaryPanel />
    </div>

    {/* Stat Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((s) => (
        <div
          key={s.label}
          className={`p-5 rounded-xl shadow-lg text-white ${s.color} flex flex-col min-h-[120px]`}
        >
          <div className="text-md font-semibold mb-1">{s.label}</div>
          <div className="text-3xl font-bold">{s.value}</div>
        </div>
      ))}
    </div>

    {/* Charts/Recent Activities placeholders */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-72">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Lead Status (Pie Chart)</h3>
        <div className="text-gray-400 text-center pt-12">[Pie Chart Placeholder]</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-72">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Deal Pipeline (Bar Chart)</h3>
        <div className="text-gray-400 text-center pt-12">[Bar Chart Placeholder]</div>
      </div>
    </div>
  </div>
);

export default Dashboard;
