const sdk = require('node-appwrite');

/*
  This function provides a secure way to verify a beta access code.
  It should be configured with an API key that has read/write access
  to the 'access_codes' collection.
  The function itself should only be executable by authenticated users.
*/
module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);

  if (
    !process.env.APPWRITE_FUNCTION_ENDPOINT ||
    !process.env.APPWRITE_FUNCTION_PROJECT_ID ||
    !process.env.APPWRITE_API_KEY
  ) {
    error('Missing environment variables for Appwrite function.');
    return res.json({
      isValid: false,
      message: 'Server configuration error.'
    }, 500);
  }

  client
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const { code } = JSON.parse(req.body);

  if (!code) {
    return res.json({ isValid: false, message: 'Access code is required.' }, 400);
  }

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      'access_codes', // Collection ID
      [
        sdk.Query.equal('code', code.trim()),
      ]
    );

    if (response.documents.length === 0) {
      return res.json({ isValid: false, message: 'Invalid access code.' }, 200);
    }

    const accessCode = response.documents[0];

    if (accessCode.isClaimed) {
      return res.json({ isValid: false, message: 'This access code has already been used.' }, 200);
    }

    // The code is valid and not claimed.
    // We don't claim it here. The client will call a separate function/service to claim it
    // after the user has successfully registered or logged in.
    return res.json({
      isValid: true,
      message: 'Access code is valid.',
      codeDetails: {
          $id: accessCode.$id,
          code: accessCode.code
      }
    }, 200);

  } catch (e) {
    error('Error verifying access code:', e);
    return res.json({
      isValid: false,
      message: 'An error occurred while verifying the code.'
    }, 500);
  }
};
