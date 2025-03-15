import { useState, useEffect } from "react";

function App() {
  const [sex, setSex] = useState("M");
  const [bodyWeight, setBodyWeight] = useState("");
  const [oneRepMaxes, setOneRepMaxes] = useState({
    Squat: "",
    Bench: "",
    Deadlift: "",
  });
  const [strengthLevels, setStrengthLevels] = useState(null);
  const [results, setResults] = useState({});
  const [validInputs, setValidInputs] = useState(true);

  useEffect(() => {
    fetch("/strengthLevels.json")
      .then((res) => res.json())
      .then((data) => setStrengthLevels(data))
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const calculateStrengthLevel = () => {
    if (!strengthLevels || !bodyWeight || isNaN(parseFloat(bodyWeight))) {
      setValidInputs(false);
      return;
    }

    const newResults: { [key: string]: string } = {};
    let allInputsValid = true;

    Object.entries(oneRepMaxes).forEach(([exercise, maxWeight]) => {
      const weight = parseFloat(maxWeight);
      const bw = parseFloat(bodyWeight);

      if (isNaN(weight) || weight <= 0 || bw <= 0) {
        newResults[exercise] = "Invalid Input";
        allInputsValid = false;
        return;
      }

      const ratio = weight / bw;
      const levels = strengthLevels[exercise][sex];

      const sortedLevels = Object.entries(levels).sort((a, b) => a[1] - b[1]);

      if (ratio < sortedLevels[0][1]) {
        newResults[exercise] = "Untrained";
        return;
      }

      let assignedLevel = "Untrained";

      for (let i = 0; i < sortedLevels.length; i++) {
        const [level, threshold] = sortedLevels[i];

        if (ratio <= threshold) {
          assignedLevel = level;
          break;
        }
      }

      const highestThreshold = sortedLevels[sortedLevels.length - 1][1];
      if (ratio > highestThreshold) {
        assignedLevel = "Freak";
      }

      newResults[exercise] = assignedLevel;
    });

    setValidInputs(allInputsValid);
    setResults(newResults);
  };

  useEffect(() => {
    calculateStrengthLevel();
  }, [sex, bodyWeight, oneRepMaxes]);

  const getBadgeClass = (level) => {
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
            className={`form-control ${
              !validInputs && (!bodyWeight || parseFloat(bodyWeight) <= 0)
                ? "is-invalid"
                : ""
            }`}
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
          />
          {!validInputs && (!bodyWeight || parseFloat(bodyWeight) <= 0) && (
            <div className="invalid-feedback">Enter a valid body weight.</div>
          )}
        </div>

        {/* 1RM Inputs */}
        <div className="row">
          {["Squat", "Bench", "Deadlift"].map((exercise) => (
            <div className="col-md-4 mb-3" key={exercise}>
              <label className="form-label">{exercise} 1RM (lbs):</label>
              <input
                type="number"
                className={`form-control ${
                  !validInputs &&
                  (!oneRepMaxes[exercise] ||
                    parseFloat(oneRepMaxes[exercise]) <= 0)
                    ? "is-invalid"
                    : ""
                }`}
                value={oneRepMaxes[exercise]}
                onChange={(e) =>
                  setOneRepMaxes((prev) => ({
                    ...prev,
                    [exercise]: e.target.value,
                  }))
                }
              />
              {!validInputs &&
                (!oneRepMaxes[exercise] ||
                  parseFloat(oneRepMaxes[exercise]) <= 0) && (
                  <div className="invalid-feedback">
                    Enter a valid {exercise} 1RM.
                  </div>
                )}
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
