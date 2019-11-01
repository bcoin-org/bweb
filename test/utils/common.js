const assert = require('bsert');

class Client {
  constructor() {
    this.http = require('http');
  }

  async request(options, assertions = []) {
    assert(Array.isArray(assertions));
    let data = options.data;

    let req, res;
    return new Promise((resolve, reject) => {
      const req = this.http.request(options, (res) => {
        res.setEncoding('utf8');
        res.body = '';

        res.on('data', (chunk) => {
          res.body += chunk;
        });

        res.on('end', () => {
          const type = res.headers['content-type'];
          if (type) {
            if (type.includes('application/json'))
              res.body = JSON.parse(res.body);
            else if (type === 'application/octet-stream')
              res.body = Buffer.from(res.body);
          }

          for (const assertion of assertions)
            assertion(req, res);

          resolve(res.body);
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      if (data)
        req.write(data);
      req.end();
    });
  }
}

function resDeepEqual(a, b) {
  return function(req, res) {
    assert.deepEqual(res[a], b);
  }
}

function resHeaderDeepEqual(a, b) {
  return function(req, res) {
    const {headers} = res;
    assert.deepEqual(headers[a], b);
  }
}

exports.Client = Client;
exports.resDeepEqual = resDeepEqual;
exports.resHeaderDeepEqual = resHeaderDeepEqual;

