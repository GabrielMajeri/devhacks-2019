const formurlencoded = require("form-urlencoded").default;
const fs = require("fs");
const https = require("https");
const open = require("open");
const readline = require("readline");
const { openBrowser, goto, write, click, closeBrowser } = require("taiko");
const uuidv1 = require("uuid/v1");

const API_HOSTNAME = "api-test.raiffeisen.ro";
const REDIRECT_URI =
  "https://testapi-rbi-merlin.apiconnect.ibmcloud.com/development/sb/forms-application/process-access-token";

const cert = fs.readFileSync("./devhacks.crt");
const key = fs.readFileSync("./devhacks.key");

const clientId =
  process.env.CLIENT_ID || "f229d0ca-f444-4a75-98c4-b8975a254d46";
const clientSecret =
  process.env.CLIENT_SECRET ||
  "uR2oU3tT4pU0eV7wA6uN0gM6fE3oN7oD0wL3rB5tR5jQ0qC7uF";
const psuId = "9999999997";

const getUserInput = prompt => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, _reject) => {
    rl.question(prompt, answer => {
      resolve(answer);

      rl.close();
    });
  });
};

const makeRequest = (method, path, headers, data, apiHostname) =>
  new Promise((resolve, reject) => {
    const hostname = apiHostname || API_HOSTNAME;
    const options = {
      hostname,
      path,
      method,
      cert,
      key,
      headers: {
        "X-IBM-Client-ID": clientId,
        "X-Request-ID": uuidv1(),
        ...headers
      }
    };

    https
      .request(options, res => {
        res.on("data", data => resolve(data));
        res.on("error", err => reject(err));
      })
      .end(data, "UTF-8");
  });

const requestConsent = async () => {
  const headers = {
    "Content-Type": "application/json",
    "PSU-ID": psuId,
    "Cache-Control": "no-cache"
  };

  const body = {
    access: {
      accounts: [
        {
          iban: "RO23RZBR0000069999999930",
          currency: "EUR"
        },
        {
          iban: "RO10RZBR0000069999999970",
          currency: "RON"
        },
        {
          iban: "RO31RZBR0000069999999980",
          currency: "RON"
        }
      ],
      balances: [
        {
          iban: "RO23RZBR0000069999999930",
          currency: "EUR"
        },
        {
          iban: "RO10RZBR0000069999999970",
          currency: "RON"
        },
        {
          iban: "RO31RZBR0000069999999980",
          currency: "RON"
        }
      ],
      transactions: [
        {
          iban: "RO23RZBR0000069999999930",
          currency: "EUR"
        },
        {
          iban: "RO10RZBR0000069999999970",
          currency: "RON"
        },
        {
          iban: "RO31RZBR0000069999999980",
          currency: "RON"
        }
      ]
    },
    recurringIndicator: true,
    validUntil: "2020-04-24",
    frequencyPerDay: 4,
    combinedServiceIndicator: false
  };
  const bodyPayload = JSON.stringify(body);

  const response = await makeRequest(
    "POST",
    "/v1/psd2-bgs-consent-api/v1/consents",
    headers,
    bodyPayload
  );

  const responseObj = JSON.parse(response);

  return responseObj.consentId;
};

const getAccessCode = async consentId => {
  const oauth2Url = `https://api-auth-test.raiffeisen.ro/psd2-rbro-oauth2-api/oauth2/authorize?response_type=code&scope=AISP&redirect_uri=${REDIRECT_URI}&consentId=${consentId}&client_id=${clientId}`;

  try {
    await openBrowser();
    await goto(oauth2Url);
    await write("9999999997");
    await click("Login");
    await click("Return");
  } catch (error) {
    console.error(error);
  } finally {
    closeBrowser();
  }

  return await getUserInput("Access code:");
};

const getAuthToken = async code => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "PSU-ID": psuId
  };
  const options = {
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: REDIRECT_URI,
    scope: "AISP"
  };
  const data = formurlencoded(options);

  const response = await makeRequest(
    "POST",
    "/psd2-rbro-oauth2-api/oauth2/token",
    headers,
    data,
    "api-auth-test.raiffeisen.ro"
  );

  return JSON.parse(response).access_token;
};

const authApp = async () => {
  const consentId = await requestConsent();
  console.log("Consent ID:", consentId);

  const authToken = await getAuthToken(await getAccessCode(consentId));
  console.log("Auth token:", authToken);

  return { consentId, authToken };
};

(async () => {
  const { consentId, authToken } = await authApp();

  const makeAPIRequest = async (method, path, headers) => {
    const response = await makeRequest(method, path, {
      Authorization: `Bearer ${authToken}`,
      "Consent-ID": consentId,
      ...headers
    });

    return JSON.parse(response);
  };

  const { accounts } = await makeAPIRequest(
    "GET",
    "/v1/psd2-accounts-api-1.3.2/accounts?withBalance=true"
  );
  console.log(accounts);

  const transactionsUrl = accounts[0]._links.transactions;
  const transactions = await makeAPIRequest(
    "GET",
    `${transactionsUrl}?bookingStatus=both`
  );

  console.log(transactions);
})();
