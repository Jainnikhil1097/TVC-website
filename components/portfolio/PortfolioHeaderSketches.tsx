"use client";

import { BlueprintSketch } from "@/components/home/sketch/BlueprintSketch";
import { MODELS } from "@/components/home/sketch/models";

/**
 * Background for the Portfolio page header: all eight mechanical blueprint sketches
 * (FIG. 01–08) as a faint wallpaper, always assembled and running ("run only"), not
 * interactive. A client component because the models carry their motion functions.
 */
export function PortfolioHeaderSketches() {
  return <BlueprintSketch models={MODELS} runOnly interactive={false} placement="background" dim={0.5} />;
}
