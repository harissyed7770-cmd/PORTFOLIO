import { ExperienceProvider } from "@/components/providers/Experience";
import { Hud } from "@/components/chrome/Hud";
import { Footer } from "@/components/chrome/Footer";
import { Genesis } from "@/components/genesis/Genesis";
import { NotOneCompany } from "@/components/sections/NotOneCompany";
import { EcosystemSection } from "@/components/ecosystem/EcosystemSection";
import { XenovoTech } from "@/components/worlds/XenovoTech";
import { XenovoEnterprises } from "@/components/worlds/XenovoEnterprises";
import { Samyam } from "@/components/worlds/Samyam";
import { DigiMitraa } from "@/components/worlds/DigiMitraa";
import { Scholar4Study } from "@/components/worlds/Scholar4Study";
import { JobTimes24 } from "@/components/worlds/JobTimes24";
import { TrendTimes } from "@/components/worlds/TrendTimes";
import { NgoNexus } from "@/components/worlds/NgoNexus";
import { Foundations } from "@/components/worlds/Foundations";
import { Mossco } from "@/components/worlds/Mossco";
import { MillionNetwork } from "@/components/sections/MillionNetwork";
import { TheBuild } from "@/components/sections/TheBuild";
import { HowIThink } from "@/components/sections/HowIThink";
import { TheLab } from "@/components/sections/TheLab";
import { Atlas } from "@/components/sections/Atlas";
import { Now } from "@/components/sections/Now";
import { Future } from "@/components/sections/Future";
import { Finale } from "@/components/sections/Finale";

export default function Page() {
  const built = new Date().toISOString().slice(0, 10);
  return (
    <ExperienceProvider>
      <Hud />
      <main id="main">
        <Genesis />
        <NotOneCompany />
        <EcosystemSection />

        {/* The worlds */}
        <XenovoTech />
        <XenovoEnterprises />
        <Samyam />
        <DigiMitraa />
        <Scholar4Study />
        <JobTimes24 />
        <TrendTimes />
        <NgoNexus />
        <Foundations />
        <Mossco />

        {/* Scale, journey, mind */}
        <MillionNetwork />
        <TheBuild />
        <HowIThink />

        {/* Living */}
        <TheLab />
        <Atlas />
        <Now />

        {/* What comes next */}
        <Future />
        <Finale />
      </main>
      <Footer built={built} />
    </ExperienceProvider>
  );
}
