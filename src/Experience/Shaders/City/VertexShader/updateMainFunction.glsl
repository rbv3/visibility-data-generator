#include <project_vertex>

// mvPosition represents the view from the camera
vec3 origin = vec3(0.0);

float isNoDeformation = abs(
    min(uIsDeformationX + uIsDeformationZ, 1.0) - 1.0
);
vec3 zDeformedPosition = getDeformationZ(mvPosition.xyz, uDiameterZ, origin);
vec3 xDeformedPosition = getDeformationX(mvPosition.xyz, uDiameterX, origin);

vec3 deformedPosition = uIsDeformationX * xDeformedPosition +
                        uIsDeformationZ * zDeformedPosition +
                        isNoDeformation * mvPosition.xyz;

gl_Position = projectionMatrix * vec4(
    deformedPosition,
    mvPosition.w
);

vec4 localWorldPosition = (modelMatrix * vec4(transformed, 1.0));
vIsInsideRadius = isInsideRadius(localWorldPosition.xyz);