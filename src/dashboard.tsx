import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, Users, Mic, Clock, FileText, Award } from "lucide-react";

// API response types
interface TotalMinutes {
  seconds: number;
  minutes: number;
}

interface TextRecording {
  text_id: number;
  content: string;
  translation: string;
  recording_count: number;
}

interface DailyRecording {
  date: string;
  recordings: number;
  seconds: number;
  minutes: number;
}

interface UserRecording {
  user_email: string;
  username: string;
  recording_count: number;
  total_duration: number;
}

const Dashboard: React.FC = () => {
  const [totalMinutes, setTotalMinutes] = useState<TotalMinutes | null>(null);
  const [totalRecordings, setTotalRecordings] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number | null>(
    null
  );
  const [recordingsByText, setRecordingsByText] = useState<TextRecording[]>([]);
  const [averageDuration, setAverageDuration] = useState<number | null>(null);
  const [dailyRecordings, setDailyRecordings] = useState<DailyRecording[]>([]);
  const [userStats, setUserStats] = useState<UserRecording[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Goal constant
  const MINUTES_GOAL = 6000;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const baseUrl =
          "https://akan-asr-backend-d5ee511bc4b5.herokuapp.com/dashboard";

        // Fetch all data in parallel
        const [
          minutesRes,
          recordingsRes,
          participantsRes,
          recordingsByTextRes,
          avgDurationRes,
          dailyRecordingsRes,
          userStatsRes,
        ] = await Promise.all([
          fetch(`${baseUrl}/total-minutes`),
          fetch(`${baseUrl}/total-recordings`),
          fetch(`${baseUrl}/total-participants`),
          fetch(`${baseUrl}/recording-count-per-text?sort=desc`),
          fetch(`${baseUrl}/average-recording-duration`),
          fetch(`${baseUrl}/daily-recordings`),
          fetch(`${baseUrl}/user-recordings-stats?sort=desc`),
        ]);

        // Process responses
        const minutes = await minutesRes.json();
        const recordings = await recordingsRes.json();
        const participants = await participantsRes.json();
        const recordingsByTextData = await recordingsByTextRes.json();
        const avgDuration = await avgDurationRes.json();
        const dailyRecordingsData = await dailyRecordingsRes.json();
        const userStatsData = await userStatsRes.json();

        // Update state with fetched data
        setTotalMinutes(minutes);
        setTotalRecordings(recordings);
        setTotalParticipants(participants);
        setRecordingsByText(recordingsByTextData.slice(0, 10)); // Top 10
        setAverageDuration(avgDuration);
        setDailyRecordings(dailyRecordingsData);
        setUserStats(userStatsData.slice(0, 7)); // Top 7

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format seconds to minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!totalMinutes) return 0;
    return (totalMinutes.minutes / MINUTES_GOAL) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <h3 className="text-red-800 text-xl font-bold">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="bg-gray-50 w-screen p-6">
      <header className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ASR Dashboard</h1>
        <p className="text-gray-600 text-center">
          Real-time analytics for Akan speech recognition
        </p>
      </header>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Total Recordings
              </p>
              <h2 className="text-3xl font-bold text-gray-800">
                {totalRecordings?.toLocaleString()}
              </h2>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Mic className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Minutes</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {totalMinutes?.minutes}
              </h2>
              <p className="text-sm text-gray-500">
                of {MINUTES_GOAL} minute goal
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              {progressPercentage.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">
              {totalMinutes?.seconds ? `${totalMinutes.seconds} seconds` : ""}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Total Participants
              </p>
              <h2 className="text-3xl font-bold text-gray-800">
                {totalParticipants}
              </h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Avg. Recording Duration
              </p>
              <h2 className="text-3xl font-bold text-gray-800">
                {averageDuration?.toFixed(1)}s
              </h2>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Recordings Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Daily Recordings
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyRecordings}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                labelFormatter={(value) =>
                  `Date: ${new Date(value).toLocaleDateString()}`
                }
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="recordings"
                name="Recordings"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="minutes"
                name="Minutes"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Texts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Top Recorded Phrases
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Akan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Translation
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recordingsByText.map((text) => (
                  <tr key={text.text_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {text.content}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {text.translation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                          {text.recording_count}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Top Contributors
          </h2>
          <div className="space-y-4">
            {userStats.map((user, index) => (
              <div
                key={user.user_email}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0
                        ? "bg-amber-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-amber-700"
                        : "bg-blue-500"
                    }`}
                  >
                    {index < 3 ? <Award className="h-5 w-5" /> : index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {user.username}
                    </h3>
                    <p
                      className="text-sm text-gray-500 truncate"
                      style={{ maxWidth: "160px" }}
                    >
                      {user.user_email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {user.recording_count} recordings
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(user.total_duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Text Recording Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recordings by Text
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={recordingsByText.slice(0, 7)}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="content" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => [value, "Recordings"]}
                labelFormatter={(label) => `Text: ${label}`}
              />
              <Bar dataKey="recording_count" name="Recordings" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Minutes Goal Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Progress Toward 6,000 Minute Goal
        </h2>
        <div className="mb-2 flex justify-between">
          <span className="text-sm font-medium text-gray-700">
            {totalMinutes?.minutes || 0} minutes recorded
          </span>
          <span className="text-sm font-medium text-gray-700">
            {MINUTES_GOAL} minutes goal
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-purple-600 h-4 rounded-full relative"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            {progressPercentage > 10 && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {progressPercentage.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-sm font-medium text-gray-700">
            {MINUTES_GOAL - (totalMinutes?.minutes || 0)} minutes remaining
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
