import React, { useEffect, useState } from "react";
import axios from "axios";
import { useWatch } from "react-hook-form";

const MalayalamSuggestInput = ({
  label,
  name,
  register,
  setValue,
  control,
  errors,
  placeholder, // ✅ added
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const formValue = useWatch({ control, name });
  const [localValue, setLocalValue] = useState("");

  // ✅ Sync input with form reset or edit mode
  useEffect(() => {
    setLocalValue(formValue || "");
  }, [formValue]);

  // 🧠 Helper: check if string contains Malayalam characters
  const isMalayalamText = (text) => /[\u0D00-\u0D7F]/.test(text);

  // ✅ Handle typing + transliteration
  const handleChange = async (e) => {
    const val = e.target.value;
    setLocalValue(val);
    if (setValue) setValue(name, val);

    const words = val.trim().split(" ");
    const lastWord = words[words.length - 1];

    // 🔤 Only suggest if last word is in English (a-z / A-Z)
    if (lastWord && /^[a-zA-Z]+$/.test(lastWord) && !isMalayalamText(lastWord)) {
      try {
        const res = await axios.get(
          `https://inputtools.google.com/request?text=${lastWord}&itc=ml-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`
        );
        if (res.data[0] === "SUCCESS") {
          setSuggestions([lastWord, ...res.data[1][0][1]]);
        }
      } catch (err) {
        console.error("Malayalam suggestion error:", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  // ✅ Replace last English word with chosen Malayalam suggestion
  const handleSelect = (selected) => {
    const words = localValue.split(" ");
    words[words.length - 1] = selected;
    const newVal = words.join(" ");
    setLocalValue(newVal);
    if (setValue) setValue(name, newVal);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (localValue.trim()) {
        if (setValue) setValue(name, localValue.trim());
        setSuggestions([]);
      }
    }
  };

  return (
    <div className="mb-3 position-relative">
      {label && <label className="form-label">{label}</label>}
      <input
        {...register(name)}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder} // ✅ placeholder now supported
        className={`form-control ${errors[name] ? "is-invalid" : ""}`}
        autoComplete="off"
        style={{
          fontFamily: "'Noto Sans Malayalam', 'Nirmala UI', sans-serif", // ✅ Malayalam font
          fontSize: "15px",
        }}
      />
      {errors[name] && (
        <div className="text-danger">{errors[name].message}</div>
      )}

      {suggestions.length > 0 && (
        <ul
          className="list-group position-absolute w-100"
          style={{
            zIndex: 10,
            maxHeight: "150px",
            overflowY: "auto",
            borderTop: "1px solid #ddd",
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(s)}
              style={{ cursor: "pointer" }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MalayalamSuggestInput;
