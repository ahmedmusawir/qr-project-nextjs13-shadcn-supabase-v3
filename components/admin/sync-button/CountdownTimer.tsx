import { useEffect, useState } from "react";

interface CountdownTimerProps {
  delayInSec: number;
}

const CountdownTimer = ({ delayInSec }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(delayInSec);

  useEffect(() => {
    // Get the delay_start_time from localStorage
    const startTime = localStorage.getItem("delay_start_time");
    if (startTime) {
      const currentTime = new Date().getTime();
      const elapsedTime = Math.floor(
        (currentTime - parseInt(startTime)) / 1000
      ); // Time elapsed in seconds

      const remainingTime = delayInSec - elapsedTime;
      setTimeLeft(remainingTime > 0 ? remainingTime : 0); // Ensure we don't go negative
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          localStorage.removeItem("delay_start_time"); // Remove delay_start_time once timer is done
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval
  }, [delayInSec]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins, secs };
  };

  const { mins, secs } = formatTime(timeLeft);

  return (
    <div className="flex items-center justify-center space-x-3 bg-gray-100 p-5">
      <div className="w-40 p-4 bg-white rounded shadow">
        <p className="text-lg font-medium text-gray-700">{mins}</p>
        <p className="text-sm text-gray-500">Mins</p>
      </div>
      <div className="w-40 p-4 bg-white rounded shadow">
        <p className="text-lg font-medium text-gray-700">{secs}</p>
        <p className="text-sm text-gray-500">Secs</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
