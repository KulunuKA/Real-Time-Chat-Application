import React, { useEffect } from "react";

export default function ModelDisplay() {
    useEffect(() => {
        const modelUrl =
          "https://firebasestorage.googleapis.com/v0/b/dev-foodworld3d.appspot.com/o/models%2FujRb3XwJJ3Ngak4GRFstRNRPRuN2%2FBurger.glb?alt=media&token=a52781dc-a182-40c9-a5f7-ef9d302f2e86"; // Replace with your GLB/GLTF file URL
        const sdk = new window.Model3D(modelUrl);
    
        // Use a timeout to ensure `model-viewer` script loads
        setTimeout(() => sdk.createModel(), 1000);
      }, []);
  return (
    <div>
      <h1>CDN Test (3D Model Viewer)</h1>
      <p>3D Model:</p>
      <div id="model-div"></div>
    </div>
  );
}
