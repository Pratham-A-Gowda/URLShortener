import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const { id } = useParams();
  const api = useApi();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [chartData, setChartData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [clicks, setClicks] = useState([]);
  const [linkInfo, setLinkInfo] = useState(null);
  const [stats, setStats] = useState({
    topReferrers: [],
    topBrowsers: [],
    peakHour: null,
    peakDay: null,
    avgClicksPerDay: 0,
  });

  useEffect(() => {
    if (!token) return;
    api
      .get("/api/links/" + id + "/analytics", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((r) => {
        const clicksData = r.data.clicks || [];
        setClicks(clicksData);

        if (clicksData.length > 0) {
          // Group clicks by date for bar chart
          const clicksByDate = {};
          const clicksByHour = {};
          const referrers = {};
          const browsers = {};

          clicksData.forEach((c) => {
            const date = new Date(c.ts).toLocaleDateString();
            const hour = new Date(c.ts).getHours();
            clicksByDate[date] = (clicksByDate[date] || 0) + 1;
            clicksByHour[hour] = (clicksByHour[hour] || 0) + 1;

            // Track referrers
            const ref = c.referrer || "Direct";
            referrers[ref] = (referrers[ref] || 0) + 1;

            // Track browsers
            const ua = c.ua || "";
            let browser = "Other";
            if (ua.includes("Chrome")) browser = "Chrome";
            else if (ua.includes("Firefox")) browser = "Firefox";
            else if (ua.includes("Safari") && !ua.includes("Chrome"))
              browser = "Safari";
            else if (ua.includes("Edge")) browser = "Edge";
            browsers[browser] = (browsers[browser] || 0) + 1;
          });

          // Bar chart data
          const dateLabels = Object.keys(clicksByDate).slice(-15);
          const dateCounts = dateLabels.map((label) => clicksByDate[label]);

          setChartData({
            labels: dateLabels,
            datasets: [
              {
                label: "Clicks per Day",
                data: dateCounts,
                backgroundColor: "rgba(56,189,248,0.7)",
                borderColor: "rgba(56,189,248,1)",
                borderWidth: 2,
              },
            ],
          });

          // Timeline data
          const hourLabels = Array.from({ length: 24 }, (_, i) => i + ":00");
          const hourCounts = hourLabels.map((_, i) => clicksByHour[i] || 0);

          setTimelineData({
            labels: hourLabels,
            datasets: [
              {
                label: "Clicks by Hour",
                data: hourCounts,
                backgroundColor: "rgba(96,174,245,0.2)",
                borderColor: "rgba(96,174,245,1)",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              },
            ],
          });

          // Calculate stats
          const topRefs = Object.entries(referrers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

          const topBrowsers = Object.entries(browsers)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));

          const peakHour = Object.entries(clicksByHour).sort(
            (a, b) => b[1] - a[1]
          )[0];

          const peakDay = Object.entries(clicksByDate).sort(
            (a, b) => b[1] - a[1]
          )[0];

          const avgClicks =
            Object.keys(clicksByDate).length > 0
              ? (clicksData.length / Object.keys(clicksByDate).length).toFixed(
                  1
                )
              : 0;

          setStats({
            topReferrers: topRefs,
            topBrowsers,
            peakHour: peakHour
              ? `${peakHour[0]}:00 (${peakHour[1]} clicks)`
              : "N/A",
            peakDay: peakDay ? `${peakDay[0]} (${peakDay[1]} clicks)` : "N/A",
            avgClicksPerDay: avgClicks,
          });
        }
      })
      .catch((err) => console.error("Analytics error:", err));
  }, [id, token]);

  const TabButton = ({ name, label }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        activeTab === name
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <h2 className="panel-title">Analytics Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="app-panel">
          <div className="text-white font-bold text-3xl">{clicks.length}</div>
          <div className="small">Total Clicks</div>
        </div>
        <div className="app-panel">
          <div className="text-white font-bold text-3xl">
            {stats.avgClicksPerDay}
          </div>
          <div className="small">Avg per Day</div>
        </div>
        <div className="app-panel">
          <div className="text-cyan-400 font-bold text-lg">
            {stats.peakHour}
          </div>
          <div className="small">Peak Hour</div>
        </div>
        <div className="app-panel">
          <div className="text-cyan-400 font-bold text-lg">{stats.peakDay}</div>
          <div className="small">Peak Day</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 mb-4">
        <TabButton name="overview" label="📊 Overview" />
        <TabButton name="traffic" label="🌐 Traffic Sources" />
        <TabButton name="timeline" label="⏰ Timeline" />
        <TabButton name="details" label="📋 Details" />
      </div>

      {/* Tab Content */}
      {clicks.length === 0 ? (
        <div className="app-panel">
          <div className="small">
            No clicks yet. Share your link to see analytics!
          </div>
        </div>
      ) : (
        <>
          {activeTab === "overview" && chartData && (
            <div className="app-panel">
              <h3 className="text-white font-bold text-xl mb-4">
                Daily Click History
              </h3>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: "rgba(159,180,200,0.65)" },
                      grid: { color: "rgba(255,255,255,0.05)" },
                    },
                    y: {
                      ticks: { color: "rgba(159,180,200,0.65)" },
                      grid: { color: "rgba(255,255,255,0.05)" },
                    },
                  },
                }}
              />
            </div>
          )}

          {activeTab === "traffic" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="app-panel">
                <h3 className="text-white font-bold text-xl mb-4">
                  Top Referrers
                </h3>
                {stats.topReferrers.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topReferrers.map((ref, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div>
                          <div className="text-white font-semibold">
                            {ref.name}
                          </div>
                          <div className="small">
                            {((ref.count / clicks.length) * 100).toFixed(1)}% of
                            traffic
                          </div>
                        </div>
                        <div className="text-cyan-400 font-bold text-2xl">
                          {ref.count}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="small">No referrer data available</div>
                )}
              </div>

              <div className="app-panel">
                <h3 className="text-white font-bold text-xl mb-4">
                  Browser Distribution
                </h3>
                {stats.topBrowsers.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topBrowsers.map((browser, idx) => {
                      const percentage = (
                        (browser.count / clicks.length) *
                        100
                      ).toFixed(1);
                      return (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-white font-semibold">
                              {browser.name}
                            </span>
                            <span className="text-cyan-400">
                              {browser.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="small">No browser data available</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "timeline" && timelineData && (
            <div className="app-panel">
              <h3 className="text-white font-bold text-xl mb-4">
                Hourly Click Pattern
              </h3>
              <Line
                data={timelineData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: "rgba(159,180,200,0.65)" },
                      grid: { color: "rgba(255,255,255,0.05)" },
                    },
                    y: {
                      ticks: { color: "rgba(159,180,200,0.65)" },
                      grid: { color: "rgba(255,255,255,0.05)" },
                    },
                  },
                }}
              />
              <div className="mt-4 text-center small">
                Shows click distribution across 24 hours
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="app-panel">
              <h3 className="text-white font-bold text-xl mb-4">
                Recent Clicks
              </h3>
              <div className="space-y-2">
                {clicks.slice(0, 20).map((click, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-semibold">
                          {new Date(click.ts).toLocaleString()}
                        </div>
                        {click.referrer && (
                          <div className="small mt-1">
                            🔗 From:{" "}
                            <span className="text-cyan-400">
                              {click.referrer}
                            </span>
                          </div>
                        )}
                        {click.ua && (
                          <div className="small mt-1">
                            🖥️ {click.ua.substring(0, 60)}...
                          </div>
                        )}
                      </div>
                      <div className="text-cyan-400 text-xs">
                        #{clicks.length - idx}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
