import snsWebSdk from '@sumsub/websdk';

/**
 * @param accessToken - access token that you generated
 * on the backend with levelName: mtc
 */
function launchWebSdk(accessToken) {
  let snsWebSdkInstance = snsWebSdk.init(
      accessToken,
      // token update callback, must return Promise
      () => fetchNewAccessToken()
    )
    .withConf({
      // language of WebSDK texts and comments (ISO 639-1 format)
      lang: 'en',
    })
    .on('onError', (error) => {
      console.log('onError', error);
      alert('Verification encountered an error. Please try again.');
    })
    .onMessage((type, payload) => {
      console.log('onMessage', type, payload);
      if (type === 'onSdkExit') {
        // Optional: Handle when user exits the SDK
        alert('Verification exited. You can retry if needed.');
      }
      if (type === 'onVerificationCompleted') {
        // Redirect to User Account Page
        window.location.href = "user-account.html";
      }
    })
    .build();

  // Launch the WebSDK by providing the container element for it
  snsWebSdkInstance.launch('#sumsub-websdk-container');
}

function initializeSumSubSDK(accessToken) {
  if (typeof snsWebSdk === 'undefined') {
    console.error('SumSub SDK is not loaded');
    alert('Verification SDK failed to load. Please try again later.');
    return;
  }

  console.log('Launching SumSub SDK');
  launchWebSdk(accessToken);
}

function fetchNewAccessToken() {
  // Implement token refresh logic if SumSub requires token refresh
  // For demonstration, returning a resolved promise with the existing token
  return Promise.resolve("prd:IEvJRQx1bbM743wVO85Np6tV.6LMeKAxre9b9kF7lqk80QS0dyibtoVLp");
}

// Listen for messages from SumSub (optional)
window.addEventListener('message', (event) => {
  if (event.data.type === 'verificationCompleted') {
    // Handle the verification completion (e.g., update UI, notify server)
    console.log('Verification completed for user:', event.data.userId);
    // Redirect or perform other actions as needed
    window.location.href = "user-account.html";
  }
});
