const jsonwebtoken = require("jsonwebtoken");
const fileSystem = require("fs");
const path = require("path");

const pathToKey = path.join(
  __dirname,
  "../config/cryptography/",
  "id_rsa_priv.pem"
);
const PRIV_KEY = fileSystem.readFileSync(pathToKey, "utf8");

// Issues JWT tokens to users
const issueJwt = (user) => {
  const _id = user.id;

  const expiresIn = "1d";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });
  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
};

// Returns a Backend error object
const errorObject = (response, statusCode, message) => {
  return response.status(statusCode).json({
    status: "error",
    message: message,
  });
};

const wordsFreqMap = (text) => {
  let words = text.split(" ");
  let wordsFreq = {};
  words.map((w) => {
    const word_key = w.toLowerCase();
    wordsFreq[word_key] = (wordsFreq[word_key] || 0) + 1;
  });
  return wordsFreq;
};

const sentenceFreqMap = (text) => {
  let sentences = text.split(".");
  let sentenceFreq = {};
  sentences.map((s) => {
    const sentence_key = s.replace(/ /g, "_").toLowerCase();
    sentenceFreq[sentence_key] = (sentenceFreq[sentence_key] || 0) + 1;
  });
  return sentenceFreq;
};

const paragraphFreqMap = (text) => {
  let paragraphs = text.split("\n");
  let paragraphsFreq = {};
  paragraphs.map((p) => {
    const paragraph_key = p.replace(/ /g, "_").toLowerCase();
    paragraphsFreq[paragraph_key] = (paragraphsFreq[paragraph_key] || 0) + 1;
  });
  return paragraphsFreq;
};

const combinedFreqMap = (text) => {
  return {
    ...wordsFreqMap(text),
    ...sentenceFreqMap(text),
    ...paragraphFreqMap(text),
  };
};

const addKeysToRefDictionary = (newDict, refDict) => {
  for (let key in newDict) {
    refDict[key] = true;
  }
};

const convertFreqMapToVector = (freqMap, refDict) => {
  let freqVector = [];
  for (let word in refDict) {
    freqVector.push(freqMap[word] || 0);
  }
  return freqVector;
};

const vectorDotProduct = (vecA, vecB) => {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
};

const magnitudeOfVector = (vec) => {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
};

const cosineSimilarity = (vecA, vecB) => {
  return (
    (
      vectorDotProduct(vecA, vecB) /
      (magnitudeOfVector(vecA) * magnitudeOfVector(vecB))
    ).toFixed(4) * 100
  );
};

const textCosineSimilarity = (
  refText,
  plagiarizedText,
  comparisonType = "all"
) => {
  const cType = comparisonType.toLowerCase();
  let FreqA;
  let FreqB;

  FreqA = combinedFreqMap(refText);
  FreqB = combinedFreqMap(plagiarizedText);
  if (!cType || cType === "all") {
    console.log("comparing words, sentences and paragraphs...");
  }
  if (cType === "words") {
    FreqA = wordsFreqMap(refText);
    FreqB = wordsFreqMap(plagiarizedText);
    console.log("comparing words...");
  }
  if (cType === "sentences") {
    FreqA = sentenceFreqMap(refText);
    FreqB = sentenceFreqMap(plagiarizedText);
    console.log("comparing sentences...");
  }
  if (cType === "paragraphs") {
    FreqA = paragraphFreqMap(refText);
    FreqB = paragraphFreqMap(plagiarizedText);
    console.log("comparing paragraphs...");
  }

  const dict = {};
  addKeysToRefDictionary(FreqA, dict);
  addKeysToRefDictionary(FreqB, dict);

  const FreqVecA = convertFreqMapToVector(FreqA, dict);
  const FreqVecB = convertFreqMapToVector(FreqB, dict);

  return cosineSimilarity(FreqVecA, FreqVecB);
};

const percentageCheat = (benchmarkStr, ExhibitStr, comparisonType = "all") => {
  const cType = comparisonType.toLowerCase();
  let benchmarkArr;
  let exhibitArr;
  benchmarkArr = [
    ...benchmarkStr.split(" "),
    ...benchmarkStr.split("."),
    ...benchmarkStr.split("\n"),
  ];
  benchmarkArr = benchmarkArr.map((str) => str.trim());
  exhibitArr = [
    ...ExhibitStr.split(" "),
    ...ExhibitStr.split("."),
    ...ExhibitStr.split("\n"),
  ];
  exhibitArr = exhibitArr.map((str) => str.trim());
  if (cType === "words") {
    benchmarkArr = benchmarkStr.split(" ");
    benchmarkArr = benchmarkArr.map((str) => str.trim());
    exhibitArr = ExhibitStr.split(" ");
    exhibitArr = exhibitArr.map((str) => str.trim());
  }
  if (cType === "sentences") {
    benchmarkArr = benchmarkStr.split(".");
    benchmarkArr = benchmarkArr.map((str) => str.trim());
    exhibitArr = ExhibitStr.split(".");
    exhibitArr = exhibitArr.map((str) => str.trim());
  }
  if (cType === "paragraphs") {
    benchmarkArr = benchmarkStr.split("\n");
    benchmarkArr = benchmarkArr.map((str) => str.trim());
    exhibitArr = ExhibitStr.split("\n");
    exhibitArr = exhibitArr.map((str) => str.trim());
  }

  let copiedCount = 0;
  for (let i = 0; i < exhibitArr.length; i++) {
    const testCase = exhibitArr[i];
    if (benchmarkArr.includes(testCase)) {
      copiedCount++;
    }
  }

  const totalExhibitsInputs = exhibitArr.length;
  const frac = (copiedCount / totalExhibitsInputs).toFixed(4) * 100;

  return frac;
};

module.exports = {
  issueJwt,
  errorObject,
  textCosineSimilarity,
  percentageCheat,
};
