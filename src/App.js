import ReactGA from "react-ga4";
import moment from "moment";
import axios from "axios";

import { useEffect, useRef, useState } from "react";
import { FiArrowRightCircle, FiTrash2, FiClock } from "react-icons/fi";
import { Configuration, OpenAIApi } from "openai";

import { set, ref as dbRef, push } from "firebase/database";
import { signInAnonymously } from "firebase/auth";

import { db, auth } from "./config/firebase.config";

const App = () => {
  ReactGA.initialize("G-K05183NSBY");

  const [query, setQuery] = useState("");
  const [qTemp, setQTemp] = useState("");
  const [result, setResult] = useState(undefined);

  const ref = useRef(null);
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    signInAnonymously(auth);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (query !== "" && !loading) {
      setLoading(true);
      setQTemp(query);

      document.getElementById(
        "result-box"
      ).innerHTML += `<strong>You:</strong> ${query} <hr/>`;

      setQuery("");

      ref.current?.scrollIntoView({ behavior: "smooth" });

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
          temperature: 0.85,
          max_tokens: 4000,
          frequency_penalty: 0,
          presence_penalty: 0.65,
          stop: ["input:"],
        })
        .then((res) => {
          resolve(res.data.choices[0].text);
        })
        .catch((err) => {
          console.log(err);
          reject(`Error with OpenAI API request: ${err.message}`);
        });
    });
  };

  useEffect(() => {
    if (result) {
      document.getElementById("result-box").innerHTML = document
        .getElementById("result-box")
        .innerHTML.replace(
          `<div class="spinner-border spinner-border-sm" style="color: var(--dark);"></div>`,
          ""
        );

      document.getElementById("result-box").innerHTML +=
        "<div style='margin-top: -50px; position: relative;'>" +
        result +
        `<hr/></div>`;

      ref.current?.scrollIntoView({ behavior: "smooth" });

      inputRef.current?.focus();

      axios
        .get("https://geolocation-db.com/json/")
        .then((res) =>
          set(
            push(
              dbRef(
                db,
                `/data/${moment().format("DDMMYYYY")}/${auth.currentUser.uid}`
              )
            ),
            {
              id: auth.currentUser.uid,
              city: res.data.city,
              country: res.data.country_name,
              query: qTemp,
              result: result,
              timestamp: moment().format("YYYY-MM-DD HH:mm"),
            }
          ).then(async () => setQTemp(""))
        )
        .catch((err) => console.log(err.message));
    }
    // eslint-disable-next-line
  }, [result]);

  useEffect(() => {
    if (loading) {
      document.getElementById(
        "result-box"
      ).innerHTML += `<div class="spinner-border spinner-border-sm" style="color: var(--dark);"></div>`;
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
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center container">
      <div className="wrapper">
        <div className="header">
          <h1>DuoBot v1.3</h1>
          <label className="switch">
            <input type="checkbox" onClick={toggleTheme} />
            <div>
              <span></span>
            </div>
          </label>
          <button
            className="history-btn"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#versionHistoryModal"
          >
            <FiClock />
          </button>
        </div>
        <div
          className="modal fade"
          id="versionHistoryModal"
          tabIndex="-1"
          aria-labelledby="versionHistoryModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-sm modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div
                className="modal-header pb-0"
                style={{ border: "none", marginBottom: -8 }}
              >
                <h5 className="modal-title">Version History</h5>
                <button
                  type="button"
                  className="btn-close mx-1"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body version-history-modal">
                <hr />
                <p>
                  v1.3 <span className="date">(07/02/2023)</span>
                </p>
                <ul>
                  <li>Better and distinct query responses</li>
                </ul>
                <p>
                  v1.2 <span className="date">(05/02/2023)</span>
                </p>
                <ul>
                  <li>UI/UX improvements</li>
                  <li>Bug fixes</li>
                </ul>
                <hr />
                <p>
                  v1.1 <span className="date">(22/01/2023)</span>
                </p>
                <ul>
                  <li>Interface updates</li>
                </ul>
                <hr />
                <p>
                  v1.0 <span className="date">(20/01/2023)</span>
                </p>
                <ul>
                  <li>Stable release upon patches</li>
                </ul>
                <hr />
                <p>
                  v0.3 <span className="date">(19/01/2023)</span>
                </p>
                <ul>
                  <li>Functionality updates</li>
                  <li>Bug fixes on repeated query calls</li>
                </ul>
                <hr />
                <p>
                  v0.2 <span className="date">(18/01/2023)</span>
                </p>
                <ul>
                  <li>UI styling</li>
                  <li>UX improvements</li>
                  <li>Color palette updates</li>
                </ul>
                <hr />
                <p>
                  v0.1 <span className="date">(15/01/2023)</span>
                </p>
                <ul>
                  <li>Project initialization</li>
                  <li>OpenAI API intergration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="inner">
          <div className="result-wrapper">
            <div
              id="result-box"
              style={{ display: result ? "block" : "hidden" }}
            />
            <div ref={ref}></div>
          </div>

          <div className="input-wrapper">
            <div className="hstack gap-3 justify-content-center w-100">
              <textarea
                placeholder="Ask me anything!"
                rows="1"
                autoFocus={true}
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSubmit(e);
                  }
                }}
              />
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
              <button type="button" onClick={handleSubmit} disabled={loading}>
                <FiArrowRightCircle />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
