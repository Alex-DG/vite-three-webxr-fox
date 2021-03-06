/*
 * Returns true if navigator has xr with 'immersive-ar' capabilities
 * Returns false otherwise.
 */
export const browserHasImmersiveArCompatibility = async () => {
  if (window.navigator.xr) {
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar')
    console.info(
      `[DEBUG] ${
        isSupported
          ? 'Browser supports immersive-ar'
          : 'Browser does not support immersive-ar'
      }`
    )
    return isSupported
  }
  return false
}

/*
 * Create and display message when no XR capabilities are found.
 */
export const displayUnsupportedBrowserMessage = () => {
  const details = document.getElementById('ar-details')
  if (details) {
    details.innerHTML = `
        😿 Your browser does not support WebXR<br></br>
        
        * If you are using Android, please try to open this app using the latest version of Chrome or Firefox.<br></br> 

        * If you are using iOS, please try the latest version of the WebXR Viewer available on the App Store.
    `
  }
}

let hitTestSource = null
let hitTestSourceRequested = false

export const handleXRHitTest = (
  renderer,
  frame,
  onHitTestResultReady,
  onHitTestResultEmpty
) => {
  const referenceSpace = renderer.xr.getReferenceSpace()
  const session = renderer.xr.getSession()

  let xrHitPoseMatrix = null

  if (session && hitTestSourceRequested === false) {
    session.requestReferenceSpace('viewer').then((referenceSpace) => {
      if (session) {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then((source) => {
            hitTestSource = source
          })
      }
    })

    hitTestSourceRequested = true
  }

  if (hitTestSource) {
    const hitTestResults = frame.getHitTestResults(hitTestSource)

    if (hitTestResults.length) {
      const hit = hitTestResults[0]

      if (hit && hit !== null && referenceSpace) {
        const xrHitPose = hit.getPose(referenceSpace)

        if (xrHitPose) {
          xrHitPoseMatrix = xrHitPose.transform.matrix
          onHitTestResultReady(xrHitPoseMatrix)
        }
      }
    } else {
      onHitTestResultEmpty()
    }
  }
}
