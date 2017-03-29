const httpRequest = new XMLHttpRequest();

/**
 * Get a generated token from the local server using the credentials specified
 *   on the back end and a specified identity.
 * @param {string} identity
 * @param {string} [appSid] - Optionally, an appSid to pass to the server. If not
 *   specified, the configured default appSid should be used by the server.
 * @returns Promise<string> - A Promise that resolved with the generated
 *   JWT token string
 */
window.getToken = function getToken(identity, appSid) {
  return new Promise((resolve, reject) => {
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      if (httpRequest.status === 200) {
        resolve(httpRequest.responseText);
      } else {
        reject(new Error('Token server responded with', httpRequest.status));
      }
    };

    httpRequest.open('POST', '/getToken', true);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    let query = `identity=${identity}`;
    if (appSid) { query += `&appSid=${appSid}`; }

    httpRequest.send(query);
  });
};
