import * as THREE from "three";

const loader = new THREE.TextureLoader();
const defaultSunDirection = new THREE.Vector3(-2, 0.5, 1.5).normalize();
function getEarthMat(sunDirection = defaultSunDirection) {

  const map = loader.load("./textures/earth-daymap-4k.jpg");
  const nightMap = loader.load("./textures/earth-nightmap-4k.jpg");
  const cloudsMap = loader.load("./textures/earth-clouds-4k.jpg");

  const uniforms = {
    dayTexture: { value: map },
    nightTexture: { value: nightMap },
    cloudsTexture: { value: cloudsMap },
    sunDirection: { value: sunDirection },
  };
  const vs = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Position
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * viewMatrix * modelPosition;

      // Model normal
      vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

      // Varyings
      vUv = uv;
      vNormal = modelNormal;
      vPosition = modelPosition.xyz;
    }
  `;

  const fs = `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform sampler2D cloudsTexture;
    uniform vec3 sunDirection;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 viewDirection = normalize(vPosition - cameraPosition);
      vec3 normal = normalize(vNormal);
      vec3 color = vec3(0.0);

      // Sun orientation
      float sunOrientation = dot(sunDirection, normal);

      // Day / night color
      float dayMix = smoothstep(- 0.25, 0.5, sunOrientation);
      vec3 dayColor = texture(dayTexture, vUv).rgb;
      vec3 nightColor = texture(nightTexture, vUv).rgb;
      color = mix(nightColor, dayColor, dayMix);

      // Specular cloud color
      vec2 specularCloudsColor = texture(cloudsTexture, vUv).rg;

      // Clouds
      float cloudsMix = smoothstep(0.0, 1.0, specularCloudsColor.g);
      cloudsMix *= dayMix;
      color = mix(color, vec3(1.0), cloudsMix);

      // Specular
      vec3 reflection = reflect(- sunDirection, normal);
      float specular = - dot(reflection, viewDirection);
      // specular = max(specular, 0.0);
      // specular = pow(specular, 0.5);
      // specular *= specularCloudsColor.r;
      // color += specular * 0.5;
      
      // Final color
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vs,
    fragmentShader: fs
  });
  return material;
}
export { getEarthMat };
