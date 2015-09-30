/**
 * PBR Fragment Shader.
 *
 * Uses Cook-Torrance Model BRDF for physical accuracy.
 *  kSpec = DFG / 4 * (V dot N) * (N dot L)
 *    Microfacet slope (D)istribution, (F)resnel term, (G)eometric attenuation,
 *    (V)iewing position, (N)ormal vector, (L)ight direction vector.
 *  D - distribution of orientation of microfacets.
 *  F - how reflectivity will change at grazing angles.
 *  G - probability a microfacet will be visible.
 *
 * @param baseColor (vec3)
 * @param lightColors (array of vec3)
 * @param lightDirections (array of vec3)
 * @param lightIntensities (array of int)
 * @param lightPositions (array of vec3)
 * @param metallic (float)
 * @param roughness (float)
 *
 * Originally adapted from: alexandre-pestana.com/webgl/PBRViewer.html
 * Modified to handle multiple lights, taking lightArraySize as a templated
 * parameter.
 * Refined PBR models with: de45xmedrsdbp.cloudfront.net/Resources/files/
 *                            2013SiggraphPresentationsNotes-26915738.pdf
 */
#define PI 3.14159265359

uniform vec3 baseColor;
uniform samplerCube envMap0;
uniform samplerCube envMap1;
uniform samplerCube envMap2;
uniform samplerCube envMap3;
uniform samplerCube envMap4;
uniform samplerCube envMap5;
uniform vec3 lightColors[{{lightArraySize}}];
uniform vec3 lightDirections[{{lightArraySize}}];
uniform int lightIntensities[{{lightArraySize}}];
uniform vec3 lightPositions[{{lightArraySize}}];
uniform float metallic;
uniform float roughness;

varying vec2 vUv;
varying mat3 tbn;
varying vec3 vPosition;
varying vec3 vTestNormal;

vec3 Diffuse(vec3 pAlbedo) {
  return pAlbedo/PI;
}

/*
 * Geometric Shadowing using Smith Sclick-GGX.
 */
float Geometric_Smith_Schlick_GGX(float a, float NdV, float NdL) {
  // Smith schlick-GGX.
  float k = a * 0.5;
  float GV = NdV / (NdV * (1.0 - k) + k);
  float GL = NdL / (NdL * (1.0 - k) + k);
  return GV * GL;
}

/*
 * Fresnel.
 */
vec3 Fresnel_Schlick(vec3 specularColor, vec3 h, vec3 v) {
  return (
    specularColor + (1.0 - specularColor) *
    pow((1.0 - clamp(dot(v, h), 0.0, 1.0)), 5.0)
  );
}

/*
 * Microfacet slope distribution.
 *
 * @param a (float)
 */
float Specular_D(float a, float NdH) {
  // Isotropic ggx.
  float a2 = a*a;
  float NdH2 = NdH * NdH;
            float denominator = NdH2 * (a2 - 1.0) + 1.0;
  denominator *= denominator;
  denominator *= PI;
	return a2 / denominator;
}

/*
 * BRDF-named alias to Fresnel.
 */
vec3 Specular_F(vec3 specularColor, vec3 h, vec3 v) {
  return Fresnel_Schlick(specularColor, h, v);
}

vec3 Specular_F_Roughness(vec3 specularColor, float a, vec3 h, vec3 v) {
  return (
    specularColor + (max(vec3(1.0 - a), specularColor) - specularColor) *
    pow((1.0 - clamp(dot(v, h), 0.0, 1.0)), 5.0)
  );
}

/*
 * BRDF-named alias to Smith-Sclick.
 */
float Specular_G(float a, float NdV, float NdL, float NdH, float VdH,
                 float LdV) {
  return Geometric_Smith_Schlick_GGX(a, NdV, NdL);
}

vec3 Specular(vec3 specularColor, vec3 h, vec3 v, vec3 l, float a, float NdL,
              float NdV, float NdH, float VdH, float LdV) {
  return (
    (Specular_D(a, NdH) * Specular_G(a, NdV, NdL, NdH, VdH, LdV)) *
    Specular_F(specularColor, v, h) ) /
    (4.0 * NdL * NdV + 0.0001);
}

vec3 ComputeLight(vec3 albedoColor, vec3 specularColor, vec3 normal,
                  vec3 lightPosition, vec3 lightColor, vec3 lightDir,
                  vec3 viewDir) {
  float NdL = clamp(dot(normal, lightDir), 0.0, 1.0);

  float NdV = clamp(dot(normal, viewDir), 0.0, 1.0);

  vec3 h = normalize(lightDir + viewDir);
  float NdH = clamp(dot(normal, h), 0.0, 1.0);
  float VdH = clamp(dot(viewDir, h), 0.0, 1.0);
  float LdV = clamp(dot(lightDir, viewDir), 0.0, 1.0);
  float a = max(0.001, roughness * roughness);

  vec3 cDiffuse = Diffuse(albedoColor);
  vec3 cSpec = Specular(specularColor, h, viewDir, lightDir, a, NdL, NdV, NdH,
                        VdH, LdV);

  return lightColor * NdL * (cDiffuse * (1.0 - cSpec) + cSpec);
}

/*
  Explanation of cubemaps:
  WebGL needs extension EXT_shader_texture_lod to use textureCubeLod,
  but it's not yet implemented.
  With textureCube the mipmap is auto-applied, and you can only add a bias.
  To avoid that, we saved each mip level in a separate cubemap.
  If there is a less awful way to do this, we'd be happy to know!
*/
vec3 ComputeEnvColor(float roughness, vec3 reflectionVector) {
  // The higher the roughness, the lower the resolution mipmap to apply.
  float a = roughness * roughness * 6.0;

  if (a < 1.0) {
    return mix(textureCube(envMap0, reflectionVector).rgb,
               textureCube(envMap1, reflectionVector).rgb, a);
  }
  if (a < 2.0) {
    return mix(textureCube(envMap1, reflectionVector).rgb,
               textureCube(envMap2, reflectionVector).rgb, a - 1.0);
  }
  if (a < 3.0) {
    return mix(textureCube(envMap2, reflectionVector).rgb,
               textureCube(envMap3, reflectionVector).rgb, a - 2.0);
  }
  if (a < 4.0) {
    return mix(textureCube(envMap3, reflectionVector).rgb,
               textureCube(envMap4, reflectionVector).rgb, a - 3.0);
  }
  if (a < 5.0) {
    return mix(textureCube(envMap4, reflectionVector).rgb,
               textureCube(envMap5, reflectionVector).rgb, a - 4.0);
  }
  return textureCube(envMap5, reflectionVector).rgb;
}

void main() {
  vec3 normal = vTestNormal;

  // viewDir: vector pointing from vertex to camera.
  vec3 viewDir = normalize(cameraPosition - vPosition);

  vec3 albedoCorrected = pow(abs(baseColor.rgb), vec3(2.2));

  vec3 realAlbedo = baseColor - baseColor * metallic;
  vec3 realSpecularColor = mix(vec3(0.03, 0.03, 0.03), baseColor, metallic);

  vec3 reflectVector = reflect(-viewDir, normal);
  vec3 envColor = ComputeEnvColor(roughness, reflectVector);

  vec3 envFresnel = Specular_F_Roughness(realSpecularColor,
                                         roughness * roughness, normal,
                                         viewDir);

  // Sum the lights.
  vec3 totalLighting = vec3(.10);
  for (int i = 0; i < {{lightArraySize}}; i++) {
    totalLighting += (
      vec3(lightIntensities[i]) *
      ComputeLight(realAlbedo, realSpecularColor, normal, lightPositions[i],
                   lightColors[i], normalize(lightDirections[i]), viewDir)
    );
  }

  gl_FragColor = vec4(totalLighting + 1.0 * envFresnel * envColor +
                      realAlbedo * 0.01, 1.0);
}
