import { useState, useEffect } from "react";
function App() {
  type StrengthLevelsType = {
    [exercise: string]: {
      [sex: string]: { [level: string]: number };
    };
  };
  type OneRepMaxesType = {
    [exercise: string]: string;
  };
  type ResultsType = OneRepMaxesType;

  const [sex, setSex] = useState("M");
  const [bodyWeight, setBodyWeight] = useState("");
  const [oneRepMaxes, setOneRepMaxes] = useState<OneRepMaxesType>({
    Squat: "",
    Bench: "",
    Deadlift: "",
  });
  const [strengthLevels, setStrengthLevels] =
    useState<StrengthLevelsType | null>(null);
  const [results, setResults] = useState<ResultsType>({
    Squat: "",
    Bench: "",
    Deadlift: "",
  });

  useEffect(() => {
    fetch("/strengthLevels.json")
      .then((res) => res.json())
      .then((data) => setStrengthLevels(data))
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const calculateStrengthLevel = () => {
    if (!strengthLevels || !bodyWeight || isNaN(parseFloat(bodyWeight))) {
      return;
    }

    const newResults: { [key: string]: string } = {};

    Object.entries(oneRepMaxes).forEach(([exercise, maxWeight]) => {
      const weight = parseFloat(maxWeight);
      const bw = parseFloat(bodyWeight);

      if (isNaN(weight) || weight <= 0 || bw <= 0) {
        newResults[exercise] = "Invalid Input";
        return;
      }

      const ratio = weight / bw;
      const levels = strengthLevels[exercise][sex];

      const sortedLevels = Object.entries(levels).sort((a, b) => a[1] - b[1]);

      let assignedLevel = "Untrained";

      const lowestThreshold = sortedLevels[0][1];
      const highestThreshold = sortedLevels[sortedLevels.length - 1][1];

      if (ratio < lowestThreshold) {
        assignedLevel = "Untrained";
      } else if (ratio === lowestThreshold) {
        assignedLevel = sortedLevels[0][0];
      } else if (ratio >= highestThreshold) {
        assignedLevel = "Freak";
      } else {
        for (let i = 1; i < sortedLevels.length - 1; i++) {
          let currentLevel = sortedLevels[i];
          let prevLevel = sortedLevels[i - 1];

          if (ratio > prevLevel[1] && ratio <= currentLevel[1]) {
            assignedLevel = currentLevel[0];
            break;
          }
        }
      }

      newResults[exercise] = assignedLevel;
    });
    setResults(newResults);
  };

  useEffect(() => {
    calculateStrengthLevel();
  }, [sex, bodyWeight, oneRepMaxes]);

  const getBadgeClass = (level: string) => {
    switch (level) {
      case "Untrained":
        return "badge bg-secondary";
      case "Beginner":
        return "badge bg-warning";
      case "Intermediate":
        return "badge bg-primary";
      case "Advanced":
        return "badge bg-info";
      case "Elite":
        return "badge bg-success";
      case "Freak":
        return "badge bg-danger";
      default:
        return "badge bg-dark";
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">💪 Strength Level Calculator</h1>

      <div className="card p-4 shadow">
        {/* Sex Selection */}
        <div className="mb-3">
          <label className="form-label">Sex:</label>
          <select
            className="form-select"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        {/* Body Weight Input */}
        <div className="mb-3">
          <label className="form-label">Body Weight (lbs):</label>
          <input
            type="number"
            className="form-control"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
          />
        </div>

        {/* 1RM Inputs */}
        <div className="row">
          {["Squat", "Bench", "Deadlift"].map((exercise) => (
            <div className="col-md-4 mb-3" key={exercise}>
              <label className="form-label">{exercise} 1RM (lbs):</label>
              <input
                type="number"
                className="form-control"
                value={oneRepMaxes[exercise]}
                onChange={(e) =>
                  setOneRepMaxes((prev) => ({
                    ...prev,
                    [exercise]: e.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="mt-4">
            <h3>Results:</h3>
            <ul className="list-group">
              {Object.entries(results).map(([exercise, level]) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={exercise}
                >
                  <strong>{exercise}:</strong>
                  <span className={getBadgeClass(level)}>{level}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
