const formurlencoded = require("form-urlencoded").default;
const fs = require("fs");
const https = require("https");
const {
  openBrowser,
  goto,
  write,
  $,
  click,
  closeBrowser,
  currentURL
} = require("taiko");
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

  let accessCode = null;
  try {
    await openBrowser();
    await goto(oauth2Url);
    await write("9999999997", $("#mat-input-0"));
    await click("Log in");
    await click("Return to TPP");
    const url = await currentURL();
    const urlParts = url.split("=");
    accessCode = urlParts[urlParts.length - 1];
  } finally {
    closeBrowser();
  }

  return accessCode;
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

class RaiffeisenAPI {
  constructor(consentId, authToken) {
    this.consentId = consentId;
    this.authToken = authToken;
  }

  static async createAPI() {
    const consentId = await requestConsent();
    //console.log("API", consentId);

    const authToken = await getAuthToken(await getAccessCode(consentId));
    //console.log("Auth", authToken);

    return new RaiffeisenAPI(consentId, authToken);
  }

  async makeAPIRequest(method, path, headers) {
    const response = await makeRequest(method, path, {
      Authorization: `Bearer ${this.authToken}`,
      "Consent-ID": this.consentId,
      ...headers
    });

    return JSON.parse(response);
  }

  async getAccounts() {
    const { accounts } = await this.makeAPIRequest(
      "GET",
      "/v1/psd2-accounts-api-1.3.2/accounts?withBalance=true"
    );

    return accounts;
  }

  async getTransactions(accountId) {
    const transactionsUrl = `/accounts/${accountId}/transactions`;
    const { transactions } = await this.makeAPIRequest(
      "GET",
      `${transactionsUrl}?bookingStatus=both`
    );
    return transactions;
  }
}

(async () => {
  const api = await RaiffeisenAPI.createAPI();
  console.log(api);
  const accounts = await api.getAccounts();
  console.log(accounts);
})();
