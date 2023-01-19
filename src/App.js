import { useEffect, useRef, useState } from "react";
import { FiArrowRightCircle, FiTrash2 } from "react-icons/fi";
import { Configuration, OpenAIApi } from "openai";

import loadingGif from "./loading.gif";

const App = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(undefined);

  const ref = useRef(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (query !== "") {
      setLoading(true);

      document.getElementById(
        "result-box"
      ).innerHTML += `<strong>You: </strong> ${query}<hr/>`;

      setQuery("");

      await fetchResult(JSON.stringify(query))
        .then((res) => {
          setLoading(false);
          res && setResult(res);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const fetchResult = async (input) => {
    const configuration = new Configuration({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    return new Promise(async (resolve, reject) => {
      if (!configuration.apiKey) {
        reject("OpenAI API key not configured");
      }

      await openai
        .createCompletion({
          model: "text-davinci-003",
          prompt: `${input}`,
          temperature: 0,
          max_tokens: 3072,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0.6,
        })
        .then((res) => {
          resolve(res.data.choices[0].text);
        })
        .catch((err) => {
          reject(`Error with OpenAI API request: ${err.message}`);
        });
    });
  };

  useEffect(() => {
    if (result) {
      document.getElementById("result-box").innerHTML = document
        .getElementById("result-box")
        .innerHTML.replace(`<img src="${loadingGif}">`, "");

      document.getElementById("result-box").innerHTML +=
        "<div style='margin-top: -50px;'>" + result + "<hr/></div>";

      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  useEffect(() => {
    if (loading) {
      document.getElementById(
        "result-box"
      ).innerHTML += `<img src=${loadingGif} />`;
    }
  }, [loading]);

  const lightTheme = {
    "--primary": "#563878",
    "--primary-rgb": "86, 56, 120",
    "--dark": "#1c1c1c",
    "--dark-rgb": "28, 28, 28",
    "--light": "#f6f6f6",
    "--light-rgb": "249, 249, 249",
  };

  const darkTheme = {
    "--primary": "#f6f6f6",
    "--primary-rgb": "249, 249, 249",
    "--dark": "#f6f6f6",
    "--dark-rgb": "249, 249, 249",
    "--light": "#1c1c1c",
    "--light-rgb": "28, 28, 28",
  };

  const [currentMode, setCurrentMode] = useState("light");
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("mode") === "dark") {
      setCurrentMode("dark");
      setIsChecked(true);
    }
  }, []);

  useEffect(() => {
    const theme = currentMode === "light" ? lightTheme : darkTheme;
    Object.keys(theme).forEach((key) => {
      const value = theme[key];
      document.documentElement.style.setProperty(key, value);
    });
    // eslint-disable-next-line
  }, [currentMode]);

  const toggleTheme = () => {
    const newMode = currentMode === "light" ? "dark" : "light";
    setIsChecked(!isChecked);
    setCurrentMode(newMode);
    localStorage.setItem("mode", newMode);
  };

  return (
    <div className="d-flex justify-content-center align-items-center container py-5">
      <div className="wrapper">
        <h1>DuoBot v1.0</h1>
        <label class="switch">
          <input type="checkbox" onClick={toggleTheme} />
          <div>
            <span></span>
          </div>
        </label>
        <br />
        <div className="position-relative hstack gap-3 justify-content-center w-100">
          <input
            type="text"
            placeholder="Ask me anything!"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e);
              }
            }}
          />
          {result && (
            <button
              id="clear-btn"
              type="button"
              onClick={() => {
                setQuery("");
                setResult("");
                setLoading(false);
                document.getElementById("result-box").innerHTML = "";
              }}
            >
              <FiTrash2 />
            </button>
          )}
          <button type="button" onClick={handleSubmit} disabled={loading}>
            <FiArrowRightCircle />
          </button>
        </div>
        <div
          id="result-box"
          style={{ display: result ? "block" : "hidden" }}
          ref={ref}
        />
      </div>
    </div>
  );
};

export default App;
