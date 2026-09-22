import { Hero } from "@/components/hero";
import { FeaturedWork } from "@/components/featured-work";
import { Intro } from "@/components/intro";
import { CtaBand } from "@/components/cta-band";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <Intro />
      <CtaBand />
    </>
  );
}
