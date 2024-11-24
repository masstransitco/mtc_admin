const crypto = require('crypto');
const axios = require('axios');
const Cors = require('micro-cors');

// Initialize micro-cors with allowed origin and methods
const cors = Cors({
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  origin: 'https://www.masstransit.company', // Frontend origin
});

const SUMSUB_SECRET_KEY = sxxPyeZ66SatdaU8i8VkMSwUW0s6xbpr; // Secret Key
const SUMSUB_APP_TOKEN = prd:IEvJRQx1bbM743wVO85Np6tV.6LMeKAxre9b9kF7lqk80QS0dyibtoVLp;   // App Token
const SUMSUB_LEVEL_NAME = mtc; // Level Name

const handler = async (req, res) => {
  console.log(`Request Method: ${req.method}`);
  console.log(`Request Origin: ${req.headers.origin}`);

  if (req.method === 'OPTIONS') {
    console.log('Handling preflight OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // Parse JSON body
    const { userId } = req.body;

    if (!userId) {
      console.log('Missing userId in request body');
      res.status(400).json({ error: 'Missing userId in request body' });
      return;
    }

    const payload = {
      userId,
      ttlInSecs: 600, // Token valid for 10 minutes
      levelName: SUMSUB_LEVEL_NAME,
    };

    console.log('Payload:', JSON.stringify(payload));

    // Generate the HMAC signature for the request
    const signature = crypto
      .createHmac('sha256', SUMSUB_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    console.log('Generated Signature:', signature);

    // API request options
    const options = {
      method: 'POST',
      url: 'https://api.sumsub.com/resources/accessTokens',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN,
        'X-App-Access-Signature': signature,
      },
      data: payload,
    };

    console.log('Making request to SumSub API with options:', {
      method: options.method,
      url: options.url,
      headers: {
        'Content-Type': options.headers['Content-Type'],
        'X-App-Token': options.headers['X-App-Token'],
        'X-App-Access-Signature': options.headers['X-App-Access-Signature'],
      },
      data: options.data,
    });

    // Make the request to SumSub API
    const response = await axios(options);

    console.log('Received response from SumSub API:', response.data);

    // Respond with the generated token
    res.status(200).json({ token: response.data.token });
  } catch (error) {
    console.error('Error generating SumSub token:', error.message);
    if (error.response) {
      // SumSub API responded with an error
      console.error('SumSub Response Data:', error.response.data);
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      // Other errors (e.g., network issues)
      res.status(500).json({ error: 'Failed to generate token' });
    }
  }
};

// Export the handler wrapped with CORS
module.exports = cors(handler);
