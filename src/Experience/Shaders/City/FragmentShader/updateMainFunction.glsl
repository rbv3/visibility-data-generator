#include <color_fragment>

// we should discard all opaque material inside radius
// we should discard all transparent materials outside radius
bool shouldDiscard = !uIsTransparent && (vIsInsideRadius > 0.0) ||
                      uIsTransparent && (vIsInsideRadius < 1.0);
if(shouldDiscard) discard;

// we want to assign uOpacity if inside
// and set 1 as default if outside
float offsetOpacity = 1.0 - uOpacity;
diffuseColor.a = 1.0 - (vIsInsideRadius * offsetOpacity);
