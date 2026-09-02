import { env_reflection_from_dir } from "./material-core.wgsl";

// Optical profile requested for the hero: low-index polished glass with visible
// spectral separation. The back and front mesh passes apply this at both interfaces.
const IOR = 1.2;
const ROUGHNESS = 0.015;
const DISPERSION_SPREAD = 0.075;

export fn dielectric_fresnel_schlick(cosTheta: f32, f0: vec3f) -> vec3f {
  let m = clamp(1.0 - cosTheta, 0.0, 1.0);
  let factor = pow(m, 5.0);
  return f0 + (vec3f(1.0) - f0) * factor;
}

export fn beer_lambert_transmittance(absorption: vec3f, thickness: f32) -> vec3f {
  return exp(-absorption * thickness);
}

fn environment_sample(
  studioCube: texture_2d_array<f32>,
  studioSampler: sampler,
  direction: vec3f,
  envYaw: f32,
  envPitch: f32,
) -> vec3f {
  let axis = select(vec3f(0.0, 1.0, 0.0), vec3f(1.0, 0.0, 0.0), abs(direction.y) > 0.9);
  let tangent = normalize(cross(axis, direction));
  let center = env_reflection_from_dir(studioCube, studioSampler, direction, envYaw, envPitch);
  let left = env_reflection_from_dir(studioCube, studioSampler, normalize(direction - tangent * ROUGHNESS), envYaw, envPitch);
  let right = env_reflection_from_dir(studioCube, studioSampler, normalize(direction + tangent * ROUGHNESS), envYaw, envPitch);
  return center * 0.92 + (left + right) * 0.04;
}

fn dispersed_transmission(
  studioCube: texture_2d_array<f32>,
  studioSampler: sampler,
  normal: vec3f,
  view: vec3f,
  envYaw: f32,
  envPitch: f32,
) -> vec3f {
  let incident = -view;
  let redDirection = refract(incident, normal, 1.0 / (IOR - DISPERSION_SPREAD * 0.5));
  let greenDirection = refract(incident, normal, 1.0 / IOR);
  let blueDirection = refract(incident, normal, 1.0 / (IOR + DISPERSION_SPREAD * 0.5));
  let fallback = normalize(mix(incident, reflect(incident, normal), 0.12));
  let red = environment_sample(studioCube, studioSampler, select(fallback, redDirection, dot(redDirection, redDirection) > 0.0), envYaw, envPitch);
  let green = environment_sample(studioCube, studioSampler, select(fallback, greenDirection, dot(greenDirection, greenDirection) > 0.0), envYaw, envPitch);
  let blue = environment_sample(studioCube, studioSampler, select(fallback, blueDirection, dot(blueDirection, blueDirection) > 0.0), envYaw, envPitch);
  return vec3f(red.r, green.g, blue.b);
}

fn grade_transmitted_light(radiance: vec3f) -> vec3f {
  // The supplied LDR sky atlases have compressed dark values. Restore a
  // studio-like light-to-shadow range only in transmission; reflected cards
  // retain their current color and intensity.
  let luminance = dot(radiance, vec3f(0.2126, 0.7152, 0.0722));
  let lighting = mix(0.58, 1.16, smoothstep(0.12, 0.75, luminance));
  return radiance * lighting;
}

export fn pointer_reflection_reveal(fragmentPosition: vec2f, interaction: vec4f) -> f32 {
  let radius = max(interaction.w, 1.0);
  let distanceFromPointer = distance(fragmentPosition, interaction.xy);
  let localReveal = 1.0 - smoothstep(radius * 0.2, radius, distanceFromPointer);
  return localReveal * clamp(interaction.z, 0.0, 1.0);
}

export fn shade_glass(
  studioCube: texture_2d_array<f32>,
  studioSampler: sampler,
  n: vec3f,
  v: vec3f,
  reflected: vec3f,
  envYaw: f32,
  envPitch: f32,
  inside: bool,
  absorptionStrength: f32,
  reflectionReveal: f32,
) -> vec4f {
  let ndotv = clamp(dot(n, v), 0.0, 1.0);
  let f0 = pow((IOR - 1.0) / (IOR + 1.0), 2.0);
  let fresnel = dielectric_fresnel_schlick(ndotv, vec3f(f0));
  let reflection = environment_sample(studioCube, studioSampler, reflected, envYaw, envPitch);
  let transmissionSample = dispersed_transmission(studioCube, studioSampler, n, v, envYaw, envPitch);
  let transmittedLight = grade_transmitted_light(transmissionSample);

  let baseThickness = select(0.20, 0.12, inside);
  let thickness = clamp(baseThickness / max(ndotv, 0.08), 0.04, 2.0);
  let absorption = beer_lambert_transmittance(vec3f(0.14) * absorptionStrength, thickness);
  let transmission = transmittedLight * absorption;

  // A dark environment direction must not turn transparent glass into a black
  // cutout. Fill only missing grazing reflection from nearby transmission.
  let rimWeight = pow(clamp(1.0 - ndotv, 0.0, 1.0), 3.0);
  let rimFloor = transmittedLight * 0.12;
  let seamlessReflection = mix(reflection, max(reflection, rimFloor), rimWeight);
  let grazing = pow(clamp(1.0 - ndotv, 0.0, 1.0), 1.35);

  // Thin-film interference alters Fresnel reflectance per wavelength. It is
  // visible only where the cursor reveals a bright environment reflection.
  let reflectionLuminance = dot(reflection, vec3f(0.2126, 0.7152, 0.0722));
  let studioLight = smoothstep(0.36, 0.84, reflectionLuminance);
  let filmThicknessNm = 390.0 + (0.5 + reflected.y * 0.5) * 110.0;
  let opticalPath = 12.566371 * 1.34 * filmThicknessNm * max(ndotv, 0.08);
  let spectralResponse = 0.5 + 0.5 * cos(
    opticalPath / vec3f(650.0, 510.0, 475.0)
  );
  let filmAmount = reflectionReveal * studioLight * (0.025 + grazing * 0.16);
  let filmReflectance = filmAmount * mix(vec3f(0.08), spectralResponse, 0.82);
  let fresnelRgb = clamp(
    fresnel + (vec3f(1.0) - fresnel) * filmReflectance,
    vec3f(0.0),
    vec3f(1.0),
  );
  let physicalGlass =
    transmission * (vec3f(1.0) - fresnelRgb) + seamlessReflection * fresnelRgb;

  // Preserve the footprint of the reflected light without adding a halo or
  // tinting the unlit material. Screen blending stays inside the glass only.
  let highlightStrength = studioLight * reflectionReveal * (0.12 + grazing * 0.22);
  let pointerLightColor = mix(
    vec3f(0.92),
    spectralResponse * 1.05,
    0.12 + studioLight * 0.16,
  );
  let pointerHighlight = pointerLightColor
    * reflectionReveal
    * (0.16 + (1.0 - grazing) * 0.22);
  let reflectedHighlight = clamp(
    seamlessReflection * highlightStrength + pointerHighlight,
    vec3f(0.0),
    vec3f(1.0),
  );
  let revealedGlass = vec3f(1.0) - (
    (vec3f(1.0) - clamp(physicalGlass, vec3f(0.0), vec3f(1.0)))
    * (vec3f(1.0) - reflectedHighlight)
  );

  // At rest the page shows through. Hover raises only the local material
  // coverage, so the cursor appears to catch an otherwise impossible object.
  let restOpacity = mix(0.018, 0.10, grazing);
  let litOpacity = mix(0.34, 0.68, grazing);
  let opacity = mix(restOpacity, litOpacity, reflectionReveal);
  return vec4f(
    revealedGlass,
    select(opacity, opacity * 0.6, inside),
  );
}
