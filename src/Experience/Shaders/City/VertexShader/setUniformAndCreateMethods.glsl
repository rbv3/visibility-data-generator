#include <common>

uniform float uDiameterX;
uniform float uDiameterZ;
uniform float uIsDeformationX;
uniform float uIsDeformationZ;
uniform float uInvisibilityRadius;
uniform vec3 uControlsPosition;

varying float vIsInsideRadius;

vec3 directionTowardsAxisZ(vec3 coordinates, float diameter, vec3 center) {
    return vec3(0, (diameter/2.0)-coordinates.y, -(coordinates.z-center.z));
}

vec3 directionTowardsAxisX(vec3 coordinates, float diameter, vec3 center) {
    return vec3(-coordinates.x, (diameter/2.0)-coordinates.y, 0);
}

vec3 floorDeformationZ(vec3 coordinates, float diameter, vec3 center) {
    float x, y, z;
    float X, Y, Z;

    Z = coordinates.z - center.z;

    float zPower2 = pow(Z, 2.0);
    float diameterPower2 = pow(diameter, 2.0);

    x = coordinates.x;
    y = (diameter * zPower2) / (diameterPower2 + zPower2);
    z = (diameterPower2 * Z) / (diameterPower2 + zPower2);

    return vec3(x, y, z + center.z);
}

vec3 floorDeformationX(vec3 coordinates, float diameter, vec3 center) {
    float X, Y, Z;

    float xPower2 = pow(coordinates.x, 2.0);
    float diameterPower2 = pow(diameter, 2.0);

    X = (diameterPower2 * coordinates.x) / (diameterPower2 + xPower2);
    Y = (diameter * xPower2) / (diameterPower2 + xPower2);
    Z = coordinates.z;

    return vec3(X, Y, Z);
}
vec3 getDeformationZ(vec3 coordinates, float diameter, vec3 center) {
    vec3 floorCoord = floorDeformationZ(vec3(coordinates.x, 0, coordinates.z), diameter, center);
    vec3 direction = normalize(directionTowardsAxisZ(coordinates, diameter, center));
    vec3 translate = direction * coordinates.y;

    return vec3(floorCoord.x + translate.x, floorCoord.y + translate.y, floorCoord.z + translate.z);
}
vec3 getDeformationX(vec3 coordinates, float diameter, vec3 center) {
    vec3 floorCoord = floorDeformationX(vec3(coordinates.x, 0, coordinates.z), diameter, center);
    vec3 direction = normalize(directionTowardsAxisX(coordinates, diameter, center));
    vec3 translate = direction * coordinates.y;

    return vec3(floorCoord.x + translate.x, floorCoord.y + translate.y, floorCoord.z + translate.z);
}
float isInsideRadius(vec3 position) {
    float distanceToCamera = distance(uControlsPosition.xz, position.xz);
    return 1.0 - min(
        floor(distanceToCamera / uInvisibilityRadius),
        1.0
    );
}