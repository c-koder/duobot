import { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";

import loadingGif from "./loading.gif";

const App = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(undefined);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (query !== "") {
      setLoading(true);

      document.getElementById(
        "result-box"
      ).innerHTML += `<strong>You: </strong> ${query} <br/><hr/>`;

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

      document.getElementById("result-box").innerHTML += result + "<hr/>";
    }
  }, [result]);

  useEffect(() => {
    if (loading) {
      document.getElementById(
        "result-box"
      ).innerHTML += `<img src=${loadingGif} />`;
    }
  }, [loading]);

  return (
    <div className="d-flex justify-content-center align-items-center container py-5">
      <div className="wrapper">
        <h1>DuoBot v1.0</h1>
        <br />
        <div className="hstack gap-3 justify-content-center w-100">
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
          <button type="button" onClick={handleSubmit} disabled={loading}>
            Ask
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResult("");
              setLoading(false);
              document.getElementById("result-box").innerHTML = "";
            }}
          >
            Clear
          </button>
        </div>
        <div id="result-box" style={{ display: result ? "block" : "hidden" }} />
      </div>
    </div>
  );
};

export default App;
